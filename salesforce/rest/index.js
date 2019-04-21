const orgs = require('./getOrg');
const rauth = require('./getRemoteAuth');
const updateRauth = require('./upsertRemoteAuth');

module.exports = function(org,oauth=null) {
    let restModule = {};

    restModule.getOrg = function (name,type='production') {
        return orgs.getOrg(org,name,type,oauth);
    }

    restModule.getRemoteAuth = function(userschema) {
        return rauth.getRauth(org,userschema,oauth);
    }

    restModule.upsertRemoteAuth = function(rauth,token) {
        return updateRauth.addOrUpdateRemoteAuth(org,token,remoteAuth,oauth);
    }

    return restModule;
}