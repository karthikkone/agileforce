const express = require('express');

const config = require('../config');
const nforce = require('nforce');
const path = require('path');
const salesforce = require('../salesforce');
const zipUtil = require('../utils').zipUtil;
const authManager = require('../salesforce').auth;

const orgManager = require('../org');
//constants
const router = express.Router();

let appWorkpaceRoot = config.app.workspaceRoot;

let sfClientId = config.salesforce.clientId;
let sfClientSecret = config.salesforce.clientSecret;
let sfRedirectUri = config.salesforce.callBackUri;

const org = nforce.createConnection({
    clientId: sfClientId,
    clientSecret: sfClientSecret,
    redirectUri: sfRedirectUri,
    mode: 'multi',
    metaOpts: {       // options for nforce-metadata
        interval: 2000  // poll interval can be specified (optional)
      },
      plugins: ['meta'] // loads the plugin in this connection 
})

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

async function _retrieve(manifest, sourceOauth) {
    let retrieveOptions = _parseRetrieveOptions(manifest);
    let metaApi = salesforce.meta(org, sourceOauth);
        metaApi.retreiveAndPoll(retrieveOptions)
        .then(function (retResp) {
            var zipfileName = 'nforce-meta-retrieval-' + retResp.id + '.zip';
            var metaZipLocation = path.join(appWorkpaceRoot, zipfileName);
            return zipUtil.createZipFrom(retResp.zipFile, metaZipLocation);
        })
        .error((err) => {
            return err;
        });
}

async function _deploy(manifest, sourceOrgOauth, targetOrgOauth,checkOnly=true) {
    try {
        let targetMeta = salesforce.meta(org,targetOrgOauth);
        let deployOptions = _parseDeployOptions(manifest);
        let metaZipLocation = await _retrieve(manifest, sourceOrgOauth);
        let metaZipBase64 = await zipUtil.readZipFrom(metaZipLocation, 'base64');
        
        if (checkOnly) deployOptions.checkOnly=true;

        targetMeta.deployAndPoll(metaZipBase64,deployOptions);
    } catch (err) {
        console.log('build task deploy failed : ',err);
        return err;
    }
}

//exports
module.exports = {

    build: async function (manifest, currentUser) {
        
        try {
            let sourceOrg = orgManager.multiModeOrg();
            let restApi = salesforce.rest(sourceOrg, currentUser.forceOauth);
            let sourceOrgName = manifest.source.org.orgId;
            let targetOrgName = manifest.target.org.orgId;

            let sourceOrgOauth;
            let targetOrgOauth;

            if (sourceOrgName == '__self__') {
                sourceOrgOauth = currentUser.forceOauth;
            } else {
                let sourceOrgData = await restApi.getOrg(sourceOrgName);
                sourceOrgOauth = await authManager.authenticateMultiModeOrg(org,
                    sourceOrgData.username__c,
                    sourceOrgData.password__c,
                    sourceOrgData.token__c
                );
            }

            console.log('target in requuest : ', targetOrgName);
            console.log('nforce org object ', JSON.stringify(org));
            //get an authenticate target org
            let targetOrgData = await restApi.getOrg(targetOrgName);

            console.log('target ORG data : ',JSON.stringify(targetOrgData))
            
            let targetOrg = orgManager.singleModeOrg();
            targetOrg.authenticate({
                username: targetOrgData.username__c,
                password: targetOrgData.password__c,
                securityToken: targetOrgData.token__c,
                },
                (err, resp) => {
                    if (!err) {
                        targetOrgOauth = resp;
                    }
                    else {
                        console.log('target org authentication failed with error ...',err);
                    }
                }
            );
            targetOrgOauth = targetOrg.oauth;
            console.log('target org oauth ', targetOrgOauth);

            switch (manifest.task) {
                case 'retrieve':
                    _retrieve(manifest, sourceOrgOauth);
                    break;
                case 'deploy':
                    _deploy(manifest, sourceOrgOauth, targetOrgOauth)
                    break;
                case 'validate':
                    _deploy(manifest, sourceOrgOauth, targetOrgOauth, checkOnly = true);
                    break;
            }
        } catch (err) {
            console.log('build failed with errors', err);
        }

    }
}