module.exports = {

    getBuild: async function (org,name,oauth) {
        console.log(`getting Build by name : ${name} | api org : ${org}`);
            let q = `SELECT Id, Name, Status__c FROM Build__c WHERE Name='${name}' LIMIT 5`;
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
                console.log('REST Build data : ',resp);
                resolve(resp.records[0]);
            });
        });    

    }

}