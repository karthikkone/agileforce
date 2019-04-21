const orgs = require('./getOrg');
const rauth = require('./getRemoteAuth');
const updateRauth = require('./upsertRemoteAuth');

module.exports = function(org,oauth=null) {
    let restModule = {};

    restModule.getOrg = function (name,type='production') {
        return orgs.getOrg(org,name,type,oauth);
    }

    restModule.getRauth = function(userschema) {
        return rauth.getRauth(org,userschema,oauth);
    }

    restModule.upsertRauth = function(rauth,token) {
        return updateRauth.addOrUpdateRemoteAuth(org,token,remoteAuth,oauth);
    }

    return restModule;
}