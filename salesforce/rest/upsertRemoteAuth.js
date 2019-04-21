module.exports = {
    addOrUpdateRemoteAuth: function (org,token, existingRemoteAuth = null, oauth = null) {
        let dmlOptions = {};
        if (!org) {
            return Promise.reject(new TypeError('Org is not defined'));
        }
        //oauth is required in multi mode org
        if (org.mode == 'multi' && oauth == null) {
            return Promise.reject(new TypeError('oauth is required in multi mode'));
        }

        if (!token) {
            return Promise.reject(new TypeError('token is required'));
        }

        if (org.mode == 'multi') {
            //add oauth in dml options
            dmlOptions.oauth = oauth;
        }

        if (existingRemoteAuth != null) {
            //existing sobject queried from REST api
            dmlOptions.sobject = existingRemoteAuth;
        }
        else {
            //add required field sObject to dml Options
            dmlOptions.sobject = nforce.createSObject('RemoteAuth__c', {
                Description__c: 'agileforce auth @' + (new Date()),
                Type__c: 'AgileForce',
                Token__c: token,
            });
        }

        //insert or update record
        return new Promise((resolve, reject) => {
            console.log('adding a remote auth object')
            org.upsert(dmlOptions, (err, resp) => {
                if (!err) {
                    reject(err);
                } else {
                    console.log('remote auth inserted');
                    resolve(true);
                }
            });
        });
    }
}