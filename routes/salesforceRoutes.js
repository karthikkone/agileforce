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

//add salesforce oauth handlers as router middleware

router.use('/callback', function(req, res, next){
    if (req.query.code) {
        org.authenticate({code: req.query.code}, function(err, response){
            if (!err) {
                console.log('Access Token: '+response.access_token);
                oauth = response;
            }
            else {
                console.log('Error: '+ err.message);
            }
        });
        next();
    } else {
        res.status(406);
        next('route'); //skip any middleware go back to route
    }
});

router.get('/callback', function(req, res) {
    
    if (oauth) {
        res.status(200).json({status: 200, message: 'authorization sucessfull'});
    } else if (res.statusCode == 406) {
        res.json({status: 406,error: 'Unexpected request'});
        
    } else {
        res.json({status: 401, error: 'Unauthorized'});
    }
});

router.get('/oauth', function(req, res){
    res.redirect(org.getAuthUri());

});
module.exports = router;