const express = require('express');

const config = require('../config');
const nforce = require('nforce');
const fs = require('fs');
const path = require('path');
const salesforce = require('../salesforce');
const zipUtil = require('../utils').zipUtil;
const authManager = require('../salesforce').auth;
const validations = require('../validations');
const core = require('../core');
const joi = require('joi');
const security = require('../security');
const users = require('../models/user');
//load nforce meta-data plugin
//require('nforce-metadata')(nforce);

//constants
const metahelper = salesforce.meta;
const router = express.Router();

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;
let appWorkpaceRoot = config.app.workspaceRoot;

const org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
    mode: 'multi', //cache oauth in connection object
    plugins: ['meta'], //load the plugin in this connection
    metaOpts: {
        pollInterval: 1000
    }
});
const dataManager = salesforce.rest(org);
//authentication
router.get('/callback', (req, res) => {

    org.authenticate({ code: req.query.code }, function (err, response) {
        if (!err) {
            var oauth = response;
            org.getIdentity({ oauth: oauth }, (err, idResp) => {
                if (!err) {
                    console.log(JSON.stringify(idResp));
                    try {
                        if (!security.auth.isRegisteredUser(idResp.username)) {
                            security.auth.registerUser(idResp.username, oauth);
                        }
                        var existingUser = users.findByUsername(idResp.username);
                        //set oauth token
                        existingUser.forceOauth=oauth;
                        existingUser.forceUserId=idResp.user_id;
                        users.updateUser(existingUser);
                        
                        var token = security.access.issue(existingUser);
                        console.log('token issued ', token);

                        //save token to connected org for api authentication
                        dataManager.getRemoteAuth(existingUser,existingUser.forceOauth)
                        .then((rauth)=>{
                            if (!rauth){
                                dataManager.addRemoteAuth(rauth,token,existingUser.forceOauth);
                            } else {
                                //update existing remote auth
                                rauth.Token__c = token;
                                dataManager.updateRemoteAuth(rauth,existingUser.forceOauth);
                            }
                        }).catch((remoteAuthErr)=>{
                            console.log('adding remote authentication to connected org failed',remoteAuthErr);
                        });

                    } catch (registrationError) {
                        console.log(registrationError);
                        return res.status(500).json({ error: 'fatal could not register authenticated user' })
                    }
                } else {
                    return res.status(500).json({ error: 'failed to get user identity' });
                }
            });
            return res.status(200).json({ message: 'authorization succeded' });
        } else {
            console.log('could not be authorized by Salesforce ', err);
            return res.status(401).json({ error: 'authorization failed' });
        }
    });
});

router.get('/oauth', function (req, res) {
    res.redirect(org.getAuthUri());

});

function isAuthorized(req, res, next) {
    if (org && org.oauth) {
        next();
    }
    else {
        return res.status(401).json({ error: 'not authorized' });
    }
}

//Salesforce REST api
router.get('/orgs', security.authFilter, (req, res) => {
    var q = 'SELECT Id, Name, Type__c, password__c, username__c FROM Org__c LIMIT 10';
    org.query({ query: q }, function (err, resp) {
        if (!err && resp.records) {
            var orgs = resp.records;
            return res.status(200).json(orgs);
        } else {
            return res.status(404).json({ error: 'no org data found' });
        }
    });
});

router.get('/meta', isAuthorized, (req, res) => {
    org.meta.listMetadata({
        queries: [
            { type: 'ApexClass' },
            { type: 'CustomObject' }
        ]
    }).then(function (md) {
        return res.status(200).json(md);
    }).error(function (err) {
        return res.status(500).json({ error: 'something went wrong fetching meta data' });
    });

});

/*
router.get('/retrieve', isAuthorized, (req, res) => {
    metahelper.retreiveAndPoll(org).then(function (retResp) {
        var zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
        var metaZipfile = path.join(appWorkpaceRoot, zipfileName);
        console.log('retrieval: ', retResp.status);
        console.log('saving retrieval to zip file ', metaZipfile);
        console.log('type of zipfile binary retrieved ', typeof (retResp.zipFile));
        var buf = Buffer.from(retResp.zipFile, 'base64');
        fs.writeFile(metaZipfile, buf, 'binary', function (err) {
            if (err) throw err
        });
        console.log('zip file saved');
    }).error(function (err) {
        console.error(err);
        return res.status(500).json({ error: 'failed to fetch and save metadata' })
    });
    return res.status(200).json({ message: "metadata retrieved successfully" });
});


router.post('/retrieveAndValidate', isAuthorized, (req, res) => {
    var targetOrgName = req.body.targetOrgName;
    var retrievedZipfile;
    var retrieveOpts = req.body.retrieveOpts;
    
    console.log('retreive options: ', retrieveOpts);
    var targetOrgConn = nforce.createConnection({
        clientId: sfClientId,
        clientSecret: sfClientSecret,
        redirectUri: sfRedirectUri,
        mode: 'single', //cache oauth in connection object
        plugins: ['meta'], //load the plugin in this connection
        metaOpts: {
            pollInterval: 1000
        }
    });

    //authenticate target salesforce org
    //targetOrgConn.authenticate({username:})
    console.log('targetOrg in request ',targetOrgName);
    if (targetOrgName) {
        metahelper.retreiveAndPoll(org,retrieveOpts)
            .then((retResp) => {
                var zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
                var metaZipLocation = path.join(appWorkpaceRoot, zipfileName);

                return zipUtil.createZipFrom(retResp.zipFile, metaZipLocation);
            })
            .then((savedZipFilePath) => {
                retrievedZipfile = savedZipFilePath;
                return dataManager.getOrg(targetOrgName, 'production');
            })
            .then((targetOrg) => {
                return authManager.authenticateSingleModeOrg(targetOrgConn, 
                    targetOrg.get('username__c'),
                    targetOrg.get('password__c'),
                    targetOrg.get('token__c')
                );
            })
            .then((targetOrgConn) => {
               return zipUtil.readZipFrom(retrievedZipfile, 'base64');
            })
            .then((metaZipBase64) => {
                return metahelper.validateAndPoll(targetOrgConn,metaZipBase64);
            })
            .then((validateResp) => {
                console.log('validation status : ', validateResp.status);
                return validateResp;
            })
            .catch((err) => {
                console.log('retrieveAndValidate operation failed with error : ' + err.message);
                console.error(err);
            });

        return res.status(202).json({ message: 'operation queued' });
    } else {
        //missing required params
        return res.status(406).json({ error: 'missing param targetOrgName' });
    }
});


router.post('/retrieveTestAndValidate', isAuthorized, (req, res) => {
    var targetOrgName = req.body.targetOrgName;
    var retrievedZipfile;
    var retrieveOpts = req.body.retrieveOpts;
    var specificTests =req.body.runTests;
    console.log('retreive options: ', retrieveOpts);
    console.log(`tests to run ${specificTests}`);
    
    var targetOrgConn = nforce.createConnection({
        clientId: sfClientId,
        clientSecret: sfClientSecret,
        redirectUri: sfRedirectUri,
        mode: 'single', //cache oauth in connection object
        plugins: ['meta'], //load the plugin in this connection
        metaOpts: {
            pollInterval: 1000
        }
    });

    //authenticate target salesforce org
    //targetOrgConn.authenticate({username:})
    console.log('targetOrg in request ',targetOrgName);
    if (targetOrgName) {
        metahelper.retreiveAndPoll(org,retrieveOpts)
            .then((retResp) => {
                var zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
                var metaZipLocation = path.join(appWorkpaceRoot, zipfileName);

                return zipUtil.createZipFrom(retResp.zipFile, metaZipLocation);
            })
            .then((savedZipFilePath) => {
                retrievedZipfile = savedZipFilePath;
                return dataManager.getOrg(targetOrgName, 'production');
            })
            .then((targetOrg) => {
                return authManager.authenticateSingleModeOrg(targetOrgConn, 
                    targetOrg.get('username__c'),
                    targetOrg.get('password__c'),
                    targetOrg.get('token__c')
                );
            })
            .then((targetOrgConn) => {
               return zipUtil.readZipFrom(retrievedZipfile, 'base64');
            })
            .then((metaZipBase64) => {
                return metahelper.validateTestAndPoll(targetOrgConn,metaZipBase64,tests=specificTests);
            })
            .then((validateResp) => {
                console.log('validation status : ', validateResp.status);
                return validateResp;
            })
            .catch((err) => {
                console.log('retrieveAndValidate operation failed with error : ' + err.message);
                console.error(err);
            });

        return res.status(202).json({ message: 'operation queued' });
    } else {
        //missing required params
        return res.status(406).json({ error: 'missing param targetOrgName' });
    }
});
*/

router.post('/build', security.authFilter, (req, res) => {
    let payload = req.body;
    console.log('API /build current user: ',req.currentUser);
    if (!payload) {
        return res.status(406).json({ error: 'build manifest is required' });
    }

    let parsed = joi.validate(payload, validations.buildManifestSchema)

    if (parsed.error) {
        return res.status(406).json({ error: 'invalid manifest: ' + parsed.error.message });
    } else {
        let buildManifest = parsed.value;
        core.build(buildManifest);
        return res.status(201).json({ message: 'operation queued' });
    }

});

module.exports = router;