module.exports = {

    getOrg: function (org,name, type = 'target', oauth) {
        console.log(`getting org by name : ${name} | api org : ${org}`);
        return new Promise((resolve, reject) => {
            let q = `SELECT Id, Name, Type__c, password__c, username__c, token__c FROM Org__c WHERE Name='${name}' AND Type__c='${type}' LIMIT 5`;
            let queryOptions = { query: q };

            if (org) {
                if (org.mode == 'multi') {
                    console.log('getOrg oauth ',JSON.stringify(oauth));
                    queryOptions.oauth = oauth;
                }
                org.query(queryOptions, (err, resp) => {
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

}