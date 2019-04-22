//required environment variables
['NODE_ENV',
'PORT',
'JWT_SECRET'].forEach((name) => {
    if (!process.env[name]) {
        throw new Error(`missing required environment variable ${name}`)
    }
});

const env = process.env.NODE_ENV; //'production' or 'test'
console.log(`loading env : ${env}`);

const production = {
    app: {
        port: parseInt(process.env.PORT) || 8080,
        workspaceRoot: process.env.APP_WORKSPACE_ROOT || 'tmp',
        db: {
            name: process.env.APP_DB_NAME || 'app-db.json'
        },
        logging: {
            level: process.env.APP_LOG_LEVEL || 'info'
        }
    },
    salesforce: {
        clientId: process.env.SF_OAUTH_CLIENT_ID ||  'SALESFORCE_OAUTH_APP_CLIENT_ID_DEV',
        clientSecret: process.env.SF_OAUTH_CLIENT_SECRET || 'SALESFORCE_OAUTH_APP_CLIENT_SECRET_DEV',
        callBackUri : process.env.SF_OAUTH_CALLBACK_URI 
    },
    security: {
        jwt: {
            secret: process.env.JWT_SECRET,
        }
    }
}

const test = {
    app: {
        port: parseInt(process.env.PORT) || 8080,
        workspaceRoot: process.env.APP_WORKSPACE_ROOT || 'tmp',
        db: {
            name: process.env.APP_DB_NAME || 'app-test-db.json'
        },
        logging: {
            level: process.env.APP_LOG_LEVEL || 'debug'
        }
    },
    salesforce: {
        clientId: process.env.SF_OAUTH_CLIENT_ID || 'SALESFORCE_OAUTH_APP_CLIENT_ID_TEST',
        clientSecret: process.env.SF_OAUTH_CLIENT_SECRET || 'SALESFORCE_OAUTH_APP_CLIENT_SECRET_TEST',
        callBackUri : process.env.SF_OAUTH_CALLBACK_URI || `localhost:8080/sforce/callback`
    },

    security: {
        jwt: {
            secret: process.env.JWT_SECRET || 'jhdgehi51@.gdyhfatg',
        }
    }
}

const config = {
    production,
    test
};

module.exports = config[env];