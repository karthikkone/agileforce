const config = require('../config');
const nforce = require('nforce');
//load nforce meta-data plugin
require('nforce-metadata')(nforce);

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

const orgConfig = {
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
    //mode: 'multi',
    plugins: ['meta'], //load the plugin in this connection
    metaOpts: {
        pollInterval: 1000
    }
}

module.exports = {
    singleModeOrg: function() {
        return nforce.createConnection(orgConfig);
    },

    multiModeOrg: function() {
        orgConfig.mode = 'multi';
        return nforce.createConnection(orgConfig);  
    }
}