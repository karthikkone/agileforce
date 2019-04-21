module.exports = {
    getRemoteAuth: function (org,userSchema, oauth) {
        let q = `SELECT Id, Name, Description__c, Type__c, Token__c FROM RemoteAuth__c WHERE ownerId='${userSchema.forceUserId}' LIMIT 1`;
        let queryOptions = { query: q };

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

        return new Promise((resolve, reject) => {
            console.log('finding remote auth object associated with user :', userSchema.username);
            org.query(queryOptions, (err, resp) => {
                if (!err) {
                    let rauth = (resp && resp.records && resp.records[0] ?
                        resp.records[0] : null);

                    resolve(rauth);
                } else {
                    reject(err);
                }
            });
        });
    }
}