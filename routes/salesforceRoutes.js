const express = require('express');

const config = require('../config');
const nforce = require('nforce');

const salesforce = require('../salesforce');
const authManager = require('../salesforce').auth;
const validations = require('../validations');
const core = require('../core');
const joi = require('joi');
const security = require('../security');
const users = require('../models/user');
const jobs = require('../models/job');
const orgManager = require('../org');
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
//authentication
router.get('/callback', (req, res) => {

    org.authenticate({ code: req.query.code }, function (err, response) {
        if (!err) {
            var oauth = response;
            org.getIdentity({ oauth: oauth }, (err, idResp) => {
                if (!err) {
                    console.log(JSON.stringify(idResp));
                    let dataManager = salesforce.rest(org, oauth);
                    try {
                        if (!security.auth.isRegisteredUser(idResp.username)) {
                            security.auth.registerUser(idResp.username, oauth);
                        }
                        var existingUser = users.findByUsername(idResp.username);
                        //set oauth token
                        existingUser.forceOauth = oauth;
                        existingUser.forceUserId = idResp.user_id;
                        users.updateUser(existingUser);

                        var token = security.access.issue(existingUser);
                        console.log('token issued ', token);

                        //save token to connected org for api authentication
                        dataManager.getRemoteAuth(existingUser, existingUser.forceOauth)
                            .then((rauth) => {
                                return dataManager.upsertRemoteAuth(token, rauth, existingUser.forceOauth);
                            }).catch((remoteAuthErr) => {
                                console.error('adding remote authentication to connected org failed', remoteAuthErr.message);
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

async function getMetadata(currentUser,payload) {
    try {

        let metaApi;
        if (payload.source.org.orgId == '__self__') {

            metaApi = salesforce.meta(orgManager.multiModeOrg(), currentUser.forceOauth);
        } else {
            let connectedOrg = orgManager.multiModeOrg();
            let restApi = salesforce.rest(connectedOrg, currentUser.forceOauth);
            let sourceOrg = await restApi.getOrg(payload.source.org.orgId);

            let sourceOrgOauth = await authManager.authenticateMultiModeOrg(org,
                sourceOrgData.get('username__c'),
                sourceOrgData.get('password__c'),
                sourceOrgData.get('token__c')
            );

            metaApi = salesforce.meta(sourceOrg, sourceOrgOauth);
        }

        let mdList = await metaApi.listMetadata({
            queries: payload.queries
        });

        return mdList;
        
    } catch (err) {
        console.log('list metadata failed with errors: ',err);
        throw err;
    }
}
router.post('/meta', security.authFilter, (req, res) => {
    let payload = req.body
    if (!payload || !payload.source.org.orgId || !payload.queries) {
        return res.status(401).json({ error: 'invalid request' });
    }
    var promise = getMetadata(req.currentUser,req.body);
    promise.then((metadata) => {
        return res.status(200).json(metadata);
    })
    .catch((err) => {
        return res.status(500).json({error: err.message});
    })
});


router.post('/build', security.authFilter, (req, res) => {
    let payload = req.body;
    console.log('API /build current user: ', req.currentUser);
    if (!payload) {
        return res.status(406).json({ error: 'build manifest is required' });
    }

    let parsed = joi.validate(payload, validations.buildManifestSchema)

    if (parsed.error) {
        return res.status(406).json({ error: 'invalid manifest: ' + parsed.error.message });
    } else {
        let buildManifest = parsed.value;

        //add job
        var jobId = jobs.addJob({ status: 'In progress', task: buildManifest.task });
        core.build(buildManifest, req.currentUser, jobId);
        return res.status(201).json({ message: 'operation queued', jobId: jobId });
    }

});

module.exports = router;