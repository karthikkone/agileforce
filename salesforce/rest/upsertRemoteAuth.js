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
            existingRemoteAuth.set('Description__c','agileforce auth @' + new Date());
            existingRemoteAuth.set('Token__c', token);

            logger.debug('Update RemoteAuth to '+JSON.stringify(existingRemoteAuth));
            dmlOptions.sobject = existingRemoteAuth;

            return new Promise((resolve, request) => {
                org.update(dmlOptions, (err, resp) => {
                    if (err) {
                        logger.error('failed to update RemoteAuth : '+ err);
                        reject(err);
                    } else {
                        logger.info('RemoteAuth updated');
                        logger.debug('RemoteAuth update result set '+JSON.stringify(resp));
                        resolve(true);
                    }
                });
            });


        } else {
            //add required field sObject to dml Options
            dmlOptions.sobject = nforce.createSObject('RemoteAuth__c', {
                Description__c: 'agileforce auth @' + (new Date()),
                Type__c: 'AgileForce',
                Token__c: token,
            });
            return new Promise((resolve, reject) => {
                //insert new
                org.insert(dmlOptions, (err, resp) => {
                    if (err) {
                        logger.error('failed to insert RemoteAuth : '+ err);
                        reject(err);
                    } else {
                        logger.info('RemoteAuth inserted');
                        logger.debug('RemoteAuth insert result set '+JSON.stringify(resp));
                        resolve(true);
                    }
                });
            });

        }
    }
}