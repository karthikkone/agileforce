module.exports = {
    //return single mode org with oauth field set 
    authenticateSingleModeOrg(org, username, password, securityToken) {
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
    }
}