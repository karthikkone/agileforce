const salesforce = require('../salesforce');
const validations = require('../validations');
const joi = require('joi');

//private methods
function _parseRetrieveOptions(manifest) {
    let retrieveOptions = {
        apiVersion: '45.0', //TODO get apiVersions from manifest
    }
    if (!manifest.components.package) {
        //retrival is unpackaged
        retrieveOptions.unpackaged = {
            types: manifest.components.types,
        }
    }

    //TODO handled single & multipackage retrievals
    return retrieveOptions;

}

function _parseDeployOptions(manifest) {
    let deployOptions = {
        apiVersion: '45.0',
    }
    let _checkOnly = true;

    if (manifest.task == 'deploy') {
        //disable deploy until testing
        //checkOnly = 'true'
    }

    if (manifest.task == 'retrieve') {
        checkOnly = 'true';
    }

    if (manifest.tests.testLevel == 'RunSpecifiedTests') {
        deployOptions.testLevel = manifest.tests.testLevel;
        deployOptions.runTests = manifest.tests.specifiedTests;
    }

    return deployOptions;
}

//exports
module.exports = {
    build: function (manifest) {
        let retrieveOptions = _parseRetrieveOptions(manifest);
        let deployOptions = _parseDeployOptions(manifest);
        console.log('core:build: retrieve = ',JSON.stringify(retrieveOptions));
        console.log('core:build: deploy = ',JSON.stringify(deployOptions));
    },

}