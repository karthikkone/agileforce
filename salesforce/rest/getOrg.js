module.exports = {

    getOrg: async function (org,name,oauth) {
        console.log(`getting org by name : ${name} | api org : ${org}`);
            let q = `SELECT Id, Name, Type__c, password__c, username__c, token__c FROM Org__c WHERE Name='${name}' LIMIT 5`;
            let queryOptions = {query: q};

            if (org.mode == 'multi' && oauth == null) {
                return Promise.reject(new Error('oauth is required in multi mode org'));
            }

            if (org.mode == 'multi') {
                queryOptions.oauth = oauth;    
            }

        return new Promise((resolve, reject)=>{
            org.query(queryOptions, (err, resp)=>{
                if (err) {
                    reject(err);
                }
                console.log('REST org data : ',resp);
                resolve(resp.records[0]);
            });
        });    

    }

}