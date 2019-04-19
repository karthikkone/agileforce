const nforce = require('nforce');

//org is nforce connection object
module.exports = function(org) {
    var module = {};
    module.getOrg = function(name,type='target',oauth=null) {
        return new Promise((resolve,reject) => {
            let q = `SELECT Id, Name, Type__c, password__c, username__c, token__c FROM Org__c WHERE Name='${name}' AND Type__c='${type}' LIMIT 5`;
            let queryOptions = {query: q};

            if (org) {
                if (org.mode == 'multi') {
                    queryOptions.oauth = oauth;
                }
                org.query(queryOptions,(err, resp)=>{
                    if (!err && resp.records) {
                        resolve(resp.records[0]);
                    } else {
                        reject(new Error(`no org found with name=${name},type=${type}`));
                    }
                });

            } else { //auth failed
                reject(new Error("authentication failure"));
            }
        });
    }

    module.getRemoteAuth = function(userSchema,oauth=null) {
        return new Promise((resolve,reject)=>{
            let q = `SELECT Id, Name, Description__c, Type__c, Token__c FROM RemoteAuth__c WHERE ownerId='${userSchema.forceUserId}' LIMIT 1`;
            let queryOptions = {query: q};

            if (!org) {
                reject(new TypeError('Org is not defined'));
            }
            //oauth is required in multi mode org
            if (org.mode == 'multi' && oauth == null) {
                reject(new TypeError('oauth is required in multi mode'));
            }

            if (!userSchema) {
                reject(new TypeError('userSchema is required'));
            }

            if (!userSchema.forceUserId) {
                reject(new TypeError('forceUserId is required'));
            }

            if (org.mode == 'multi') {
                queryOptions.oauth = oauth;
            }

            org.query(queryOptions, (err, resp)=>{
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

    module.addRemoteAuth = function(token,oauth=null) {
        return new Promise((resolve, reject)=>{
            let dmlOptions = {};
            if (!org) {
                reject(new TypeError('Org is not defined'));
            }
            //oauth is required in multi mode org
            if (org.mode == 'multi' && oauth == null) {
                reject(new TypeError('oauth is required in multi mode'));
            }

            if(!token) {
                reject(new TypeError('token is required'));
            }

            if (org.mode == 'multi') {
                //add oauth in dml options
                dmlOptions.oauth = oauth;
            }

             //add required field sObject to dml Options
            dmlOptions.sobject = nforce.createSObject('RemoteAuth__c',{
                Description__c: 'agileforce auth @'+ (new Date()),
                Type__c: 'AgileForce',
                Token__c: token,
            });
            //insert record
            org.insert(dmlOptions, (err, resp)=>{
                if (!err) {
                    reject(err);
                } else {
                    console.log('remote auth inserted');
                    resolve(true);
                }
            })

        });
    }


    module.updateRemoteAuth = function(remoteAuth,oauth=null) {
        return new Promise((resolve, reject)=>{
            let dmlOptions = {};
            if (!org) {
                reject(new TypeError('Org is not defined'));
            }
            //oauth is required in multi mode org
            if (org.mode == 'multi' && oauth == null) {
                reject(new TypeError('oauth is required in multi mode'));
            }

            if (org.mode == 'multi') {
                //add oauth in dml options
                dmlOptions.oauth = oauth;
            }

             //add required field sObject to dml Options
            dmlOptions.sobject = remoteAuth;
            //insert record
            org.update(dmlOptions, (err, resp)=>{
                if (!err) {
                    reject(err);
                } else {
                    console.log('remote auth inserted');
                    resolve(true);
                }
            })

        });
    }

    return module;
}