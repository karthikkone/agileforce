const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const fs = require('fs');
const path = require('path');
//load nforce meta-data plugin
require('nforce-metadata')(nforce);

const authHelper = require('../services/authHelper');

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

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

router.get('/meta',isAuthorized,(req, res)=> {
    org.meta.listMetadata({
        queries:[
            {type: 'ApexClass'},
            {type: 'CustomObject'}
        ]
    }).then(function(md){
        return res.status(200).json(md);
    }).error(function(err) {
        return res.status(500).json({error: 'something went wrong fetching meta data'});
    });

});

router.get('/retrieve', isAuthorized, (req, res) =>{

    var retrievePromise = org.meta.retrieveAndPoll({
        apiVersion: '45.0',
        unpackaged: {
            version: '45.0',
            types: [
                {
                name: 'CustomObject',
                members: ['*']
                }
            ]
        }
    });

    retrievePromise.poller.on('poll', (pollRes) => {
        console.log('poll status: ',pollRes);
        return retrievePromise;
    });

    retrievePromise.then(function(retResp){
        console.log('retrieval: ',retResp.status);
        console.log('saving retrieval as zip file ..');
        var zipfileName = 'nforce-meta-retrieval-'+retResp.id+'.zip';
        var metaZipfile = path.join('..','public','workspace',zipfileName);
        var buf = Buffer.from(retResp.zipfile, 'base64');
        fs.writeFile(metaZipfile, buf, 'binary', function(err){
            if (err) throw err
        });
        console.log('zip file saved');
    }).error(function (err){
        console.error(err);
        return res.status(500).json({error: 'failed to fetch and save metadata'})
    });
    return res.status(200).json({message: "metadata retrieved successfully"});
});

module.exports = router;