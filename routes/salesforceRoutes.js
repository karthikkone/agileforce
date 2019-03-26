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
        org.authenticate(function(request, response){
            oauth = response;
            console.log('oauth = ', oauth);
        });
        next();
    } else {
        res.status(406);
        next('route'); //skip any middleware go back to route
    }
});

router.get('/callback', function(req, res) {
    res.end();
});

router.get('/oauth', function(req, res){
    res.redirect(org.getAuthUri());

});
module.exports = router;