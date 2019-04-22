const deploy = require('./deploy');
const validate = require('./validate');
const retrieve = require('./retreive');

module.exports = function(org, oauth) {
    let metaModule = {};

    metaModule.deployAndPoll = function(metaZipFile, deployOptions) {
        return deploy.deployAndPoll(org,metaZipFile,deployOptions,oauth);
    }

    metaModule.validateAndPoll = function(metaZipFile,deployOptions) {
        return validate.validateAndPoll(org,metaZipFile,deployOptions,oauth);
    }

    metaModule.retrieveAndPoll = function(retrieveOptions) {
        return retrieve.retrieveAndPoll(org,retrieveOptions,oauth);
    }
    return metaModule;
}