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
});

router.get('/callback',(req, res)=>{
    console.log('response 1 ',res);
    org.authenticate({code: req.query.code}, function(err, response){
        console.log('response 2 ',res);
        if (!err) {
            console.log('response 3 ',res);
            console.log('OK auth success ',response);
            return res.status(200).json({message:'authorization succeded'});
        } else {
            console.log('response 4 ',res);
            return res.status(401).json({error: 'authorization failed'});
        }
    });
    console.log('response 5 ',res);
});

router.get('/oauth', function (req, res) {
    res.redirect(org.getAuthUri());

});

module.exports = router;