const orgs = require('./getOrg');
const rauth = require('./getRemoteAuth');
const updateRauth = require('./upsertRemoteAuth');

module.exports = function(org,oauth=null) {
    let restModule = {};

    restModule.getOrg = function (name,type='production') {
        console.log('org passed = ',org)
        return orgs.getOrg(org,name,type,oauth);
    }

    restModule.getRemoteAuth = function(userschema) {
        return rauth.getRemoteAuth(org,userschema,oauth);
    }

    restModule.upsertRemoteAuth = function(rauth,token) {
        return updateRauth.addOrUpdateRemoteAuth(org,token,rauth,oauth);
    }

    return restModule;
}