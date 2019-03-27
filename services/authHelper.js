const config = require('../config/config');
const nforce = require('nforce');


let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

var org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
});

//gets access token from Salesforce with given a code
function salesforceAuthorize(accessCode) {

    return new Promise((resolve, reject) => {

        if (!accessCode) {
            reject(new Error("no valid access code"));
        }
        org.authenticate({ code: accessCode }, function (err, response) {
            if (!err) {
                console.log('Access Token: ' + response.access_token);
                // response object contains authorization data
                resolve(response);
            }
            else {
                console.log('Error: ' + err.message);
                reject(err);
            }
        });
    });
}

function getSalesforceAuthUri() {
    return org.getAuthUri();
}
module.exports = {
    salesforceAuthorize,
    getSalesforceAuthUri
}