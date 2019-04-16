const express = require('express');

const config = require('../config');
const nforce = require('nforce');
const fs = require('fs');
const path = require('path');
const salesforce = require('../salesforce');
const zipUtil = require('../utils').zipUtil;
const authManager = require('../salesforce').auth;

//load nforce meta-data plugin
require('nforce-metadata')(nforce);

//constants
const metahelper = salesforce.meta;
const router = express.Router();

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;
let appWorkpaceRoot = config.app.workspaceRoot;

const org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
    mode: 'single', //cache oauth in connection object
    plugins: ['meta'], //load the plugin in this connection
    metaOpts: {
        pollInterval: 1000
    }
});

const dataManager = salesforce.rest(org);
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

    if (manifest.task == 'validate') {
        checkOnly = 'true';
    }

    if (manifest.tests.testLevel == 'RunSpecifiedTests') {
        deployOptions.testLevel = manifest.tests.testLevel;
        deployOptions.runTests = manifest.tests.specifiedTests;
    }

    return deployOptions;
}

function _retrieve(manifest) {
    let retrieveOptions = _parseRetrieveOptions(manifest);

    metahelper.retreiveAndPoll(org).then(function (retResp) {
        let zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
        let metaZipfile = path.join(appWorkpaceRoot, zipfileName);
        console.log('retrieval: ', retResp.status);
        console.log('saving retrieval to zip file ', metaZipfile);

        let buf = Buffer.from(retResp.zipFile, 'base64');
        fs.writeFile(metaZipfile, buf, 'binary', function (err) {
            if (err) throw err
        });
        console.log('zip file saved');
    }).error((err) => {
        console.error(err);
    });
}

function _deploy(manifest, checkOnly = true) {
    let targetOrgName = manifest.target.org.orgId;
    let retrievedZipfile;
    let retrieveOpts = _parseRetrieveOptions(manifest);
    let deployOpts = _parseDeployOptions(manifest);

    if (!deployOpts) {
        throw new Error('deployOptions is missing');
    }

    console.log('retreive options: ', retrieveOpts);
    var targetOrgConn = nforce.createConnection({
        clientId: sfClientId,
        clientSecret: sfClientSecret,
        redirectUri: sfRedirectUri,
        mode: 'single', //cache oauth in connection object
        plugins: ['meta'], //load the plugin in this connection
        metaOpts: {
            pollInterval: 1000
        }
    });

    //authenticate target salesforce org
    //targetOrgConn.authenticate({username:})
    console.log('targetOrg in request ', targetOrgName);
    if (targetOrgName) {
        metahelper.retreiveAndPoll(org, retrieveOpts)
            .then((retResp) => {
                var zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
                var metaZipLocation = path.join(appWorkpaceRoot, zipfileName);

                return zipUtil.createZipFrom(retResp.zipFile, metaZipLocation);
            })
            .then((savedZipFilePath) => {
                retrievedZipfile = savedZipFilePath;
                return dataManager.getOrg(targetOrgName, 'production');
            })
            .then((targetOrg) => {
                return authManager.authenticateSingleModeOrg(targetOrgConn,
                    targetOrg.get('username__c'),
                    targetOrg.get('password__c'),
                    targetOrg.get('token__c')
                );
            })
            .then((targetOrgConn) => {
                return zipUtil.readZipFrom(retrievedZipfile, 'base64');
            })
            .then((metaZipBase64) => {
                return metahelper.validateAndPoll(targetOrgConn, metaZipBase64, deployOpts);
            })
            .then((validateResp) => {
                console.log('validation status : ', validateResp.status);
                return validateResp;
            })
            .catch((err) => {
                console.log('retrieveAndValidate operation failed with error : ' + err.message);
                console.error(err);
            });
    }
}
//exports
module.exports = {
    build: function (manifest) {

        switch (manifest.task) {
            case 'retrieve':
                _retrieve(manifest);
                break;
            case 'validate':
                _deploy(manifest, checkOnly = true);
                break;
            case 'deploy':
                _deploy(manifest, checkOnly = false);
                break;
            default:
                throw new Error('Invalid task');
                break;
        }
    }
}