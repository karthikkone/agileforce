const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const authHelper = require('../services/authHelper');

const nforce = require('nforce');


let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

var org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
});

router.get('/callback',(req, res)=>{
    org.authenticate({code: req.query.code}, function(err, response){
        if (!err) {
            console.log('OK auth success ',response);
            res.status(200).json({message:'authorization succeded'});
        } else {
            res.status(401).json({error: 'authorization failed'});
        }
    });
});

router.get('/oauth', function (req, res) {
    res.redirect(org.getAuthUri());

});

module.exports = router;