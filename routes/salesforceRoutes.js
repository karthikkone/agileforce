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
router.get('/callback',(req, res)=>{
    
    org.authenticate({code: req.query.code}, function(err, response){
        if (!err) {
            console.log('could not be authorized by Salesforce ', err);
            return res.status(200).json({message:'authorization succeded'});
        } else {
            console.log('authorized by salesforce');
            return res.status(401).json({error: 'authorization failed'});
        }
    });
    console.log('response 5 ',res);
});

router.get('/oauth', function (req, res) {
    res.redirect(org.getAuthUri());

});


//Salesforce REST api
router.get('/accounts', (req, res)=>{
    var q = 'SELECT Id, Name, CreatedDate, BillingCity FROM Account LIMIT 10';
    org.query({query:q}, function(err, resp){
        if (!err && resp.records) {
            var accs = resp.records[0];
            return res.status(200).json(accs);
        } else {
            return res.status(400).json({error: 'no org data found'});
        }
    });
})
module.exports = router;