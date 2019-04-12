const express = require('express');

const config = require('../config');
const nforce = require('nforce');
const fs = require('fs');
const path = require('path');
const salesforce = require('../salesforce');
const zipUtil = require('../utils').zipUtil;
const authManager = require('../salesforce').auth;
//load nforce meta-data plugin
require('nforce-metadata')(nforce);

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
    mode: 'single', //cache oauth in connection object
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
            console.log('authorized by Salesforce');
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
router.get('/orgs', isAuthorized, (req, res) => {
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

module.exports = router;