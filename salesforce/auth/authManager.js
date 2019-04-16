module.exports = {
    //return single mode org with oauth field set 
    authenticateSingleModeOrg: function(org, username, password, securityToken) {
        return new Promise((resolve, reject) => {
        
            if (org && username && password && securityToken) {
                org.authenticate({username: username, password: password, securityToken: securityToken},
                    (err, auth) => {
                        if (!err) {
                            resolve(org);
                        } else {
                            reject(err);
                        }
                    }
                );
            } else {
                reject(new Error(`org: ${org}, username, password or securityToken missing`));
            }
        });
    },

    //code is access code in web server oauth flow
    authenticateMultiModeOrg: function(org, code) {
        return new Promise((resolve, reject) => {

            if (org && code) {
                org.authenticate({code: code}, (err, resp) => {
                    if (!err) {
                        resolve(resp) //resp is oauth object
                    } else {
                        reject(err);
                    }
                });
            } else {
                reject(new Error(`org: ${org} or access code : ${code} missing`));
            }
        })
    }
}