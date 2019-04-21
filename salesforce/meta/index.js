const deploy = require('./deploy');
const validate = require('./validate');
const retrieve = require('./retreive');

module.exports = function(org, ouath=null) {
    let metaModule = {};

    metaModule.deployAndPoll = function(metaZipFile, deployOptions) {
        return deploy.deployAndPoll(org,metaZipFile,deployOptions,oauth);
    }

    metaModule.validateAndPoll = function(metaZipFile,deployOptions) {
        return validate.validateAndPoll(org,metaZipFile,deployOptions,oauth);
    }

    metaModule.retrieveAndPoll = function() {
        return retrieve.retreiveAndPoll(org,retrieveOptions,oauth);
    }
}