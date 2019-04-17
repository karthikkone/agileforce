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

    module.addRemoteAuth = function(userSchema,token,oauth=null) {
        return new Promise((resolve,reject)=>{

        });
    }

    return module;
}