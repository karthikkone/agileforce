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

module.exports = function(req, res, next) {
    if (req.query.code) {
        sfCode = req.query.code;
        org.authenticate({code: sfCode}, (err, resp)=>{
            if (!err) {
            console.log('Access token : '+resp.access_token);
            oauth = resp;
            
            } else {
                console.log('failed to get access token');
            }
        });

    } else {
        return res.status(406).json({error: 'Unexpected request no valid code found'});
    }
    next();
}