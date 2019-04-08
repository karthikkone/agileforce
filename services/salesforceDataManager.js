//org is nforce connection object
module.exports = function(org) {
    var module = {};
    module.getOrg=function(name,type='target') {
        return new Promise((resolve,reject) => {
            var q = `SELECT Id, Name, Type__c, password__c, username__c FROM Org__c WHERE Name='${name}' AND Type__c='${type}' LIMIT 5`;
            
            if (org && org.oauth) {
                org.query({query: q},(err, resp)=>{
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
    return module;
}