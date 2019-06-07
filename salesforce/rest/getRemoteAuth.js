const logger = require('../../logger');
module.exports = {
    getRemoteAuth: function (org,userSchema, oauth) {
        
        if (!org) {
            return Promise.reject(new TypeError('Org is not defined'));
        }
        //oauth is required in multi mode org
        if (org.mode == 'multi' && oauth == null) {
            return Promise.reject(new TypeError('oauth is required in multi mode'));
        }

        if (!userSchema) {
            return Promise.reject(new TypeError('userSchema is required'));
        }

        if (!userSchema.forceUserId) {
            return Promise.reject(new TypeError('forceUserId is required'));
        }

        if (org.mode == 'multi') {
            queryOptions.oauth = oauth;
        }

        let q = `SELECT Id, Name, Description__c, Type__c, Token__c FROM RemoteAuth__c WHERE ownerId='${userSchema.forceUserId}' LIMIT 1`;
        let queryOptions = { query: q };

        //DEBUG show query
        logger.debug(`[Query RemoteAuth] ${q}`);

        return new Promise((resolve, reject) => {
           logger.info('finding remote auth object associated with user :', userSchema.username);
           logger.debug(`finding remote auth object username = ${userSchema.username} userid: ${userSchema.forceUserId}`);
            org.query(queryOptions, (err, resp) => {
                if (!err) {
                    let rauth = (resp && resp.records && resp.records[0] ?
                        resp.records[0] : null);
                    logger.debug('found remote auth object : '+JSON.stringify(rauth));
                    resolve(rauth);
                } else {
                    reject(err);
                }
            });
        });
    }
}