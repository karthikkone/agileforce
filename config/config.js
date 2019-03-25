const env = process.env.NODE_ENV; //'dev' or 'test'

const dev = {
    app: {
        port: parseInt(process.env.PORT) || 8080
    },
    salesforce: {
        clientId: process.env.SF_OAUTH_CLIENT_ID ||  'SALESFORCE_OAUTH_APP_CLIENT_ID_DEV',
        clientSecret: process.env.SF_OAUTH_CLIENT_SECRET || 'SALESFORCE_OAUTH_APP_CLIENT_SECRET_DEV',
        callBackUri : process.env.SF_OAUTH_CALLBACK_URI
    }
}

const test = {
    app: {
        port: parseInt(process.env.PORT) || 8080
    },
    salesforce: {
        clientId: process.env.SF_OAUTH_CLIENT_ID || 'SALESFORCE_OAUTH_APP_CLIENT_ID_TEST',
        clientSecret: process.env.SF_OAUTH_CLIENT_SECRET || 'SALESFORCE_OAUTH_APP_CLIENT_SECRET_TEST',
        callBackUri : process.env.SF_OAUTH_CALLBACK_URI || `localhost:8080/sforce/callback`
    }
}

const config = {
    dev,
    test
};

module.exports = config[env];