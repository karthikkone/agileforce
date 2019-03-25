const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');


let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;
let accessCode;
var oauth;

var org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
});

router.get('/callback', function(req, res) {
    if (req.params['code']) {
        sfCode = req.params['code'];
        org.authenticate({code: sfCode}, (err, resp)=>{
            if (!err) {
            console.log('Access token : '+resp.access_token);
            oauth = resp;
            res.status(200).json({message: 'Authorized by Salesforce'});
            } else {
                console.log('failed to get access token');
                res.status(401).json({error: 'Not Authorized by Salesforce'});
            }
        });
    } else {
        res.status(406).json({error: 'Unexpected request no valid code found'});
    }
});

router.get('/oauth', function(req, res){
    res.redirect(org.getAuthUri());

});
module.exports = router;