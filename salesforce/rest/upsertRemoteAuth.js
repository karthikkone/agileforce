const nforce = require('nforce');
const logger = require('../../logger');
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
            //update existing sobject queried from REST api
            existingRemoteAuth.Description__c =  'agileforce auth @' + (new Date());
            existingRemoteAuth.Token__c = token;
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
            logger.info('adding a remote auth object')
            org.upsert(dmlOptions, (err, resp) => {
                if (!err) {
                    logger.error('failed to upsert RemoteAuth : '+ err);
                    reject(err);
                } else {
                    logger.info('Remote auth inserted');
                    logger.debug('remote auth upsert result set '+JSON.stringify(resp));
                    resolve(true);
                }
            });
        });
    }
}