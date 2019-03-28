const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const authHelper = require('../services/authHelper');

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

const org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
    mode: 'single' //cache oauth in connection object
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
    var q = 'SELECT Name, Id, Type__c FROM Org__c LIMIT 10';
    org.query({ query: q }, function (err, resp) {
        if (!err && resp.records) {
            var orgs = resp.records;
            return res.status(200).json(orgs);
        } else {
            return res.status(400).json({ error: 'no org data found' });
        }
    });
});
module.exports = router;