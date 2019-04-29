const orgs = require('./getOrg');
const rauth = require('./getRemoteAuth');
const updateRauth = require('./upsertRemoteAuth');
const builds = require('./getBuild');
const buildUpdates = require('./updateBuild');
module.exports = function(org,oauth) {
    let restModule = {};

    restModule.getOrg = function (name) {
        console.log('org passed = ',org)
        console.log('oauth passed to rest : ',oauth);
        return orgs.getOrg(org,name,oauth);
    }

    restModule.getRemoteAuth = function(userschema) {
        return rauth.getRemoteAuth(org,userschema,oauth);
    }

    restModule.upsertRemoteAuth = function(rauth,token) {
        return updateRauth.addOrUpdateRemoteAuth(org,token,rauth,oauth);
    }

    restModule.getBuild = function(name) {
        return builds.getBuild(org,name,oauth);
    }

    restModule.updateBuild = function(build) {
        return buildUpdates.updateBuild(org,build,oauth);
    }

    return restModule;
}