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
const logger = require('../logger');
const jobs = require('../models/job');
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
    try {
        logger.debug(`retrieve: source org Oauth: ${sourceOauth}`)
        let retrieveOptions = _parseRetrieveOptions(manifest);
        logger.info(`retrieve: retrieve options: ${retrieveOptions}`);
        let metaApi = salesforce.meta(org, sourceOauth);
        let retrieval = await metaApi.retrieveAndPoll(retrieveOptions);

        logger.info(`retrieve: retrieval id : ${retrieval.id} done`);

        let zipFileName = 'nforce-meta-retrieval-' + retrieval.id + '.zip';
        let metaZipLocation = path.join(appWorkpaceRoot, zipFileName);

        logger.info(`meta data will be saved to metaZipLocation`);
        //create metadata zip and return file path
        let saveLocation = await zipUtil.createZipFrom(retrieval.zipFile, metaZipLocation);
        return saveLocation;
    } catch (err) {
        console.log('build: retrieve failed with error : ', err);
        return err;
    }
}

async function _deploy(manifest, sourceOrgOauth, targetOrgOauth,checkOnly = true) {
    try {

        logger.info('starting build taks : deploy');
        logger.debug(`deploy: source org oauth : ${sourceOrgOauth}`);
        logger.debug(`deploy: target org oauth : ${targetOrgOauth}`);

        let targetOrg = orgManager.multiModeOrg();
        let targetMeta = salesforce.meta(targetOrg, targetOrgOauth);
        let deployOptions = _parseDeployOptions(manifest);

        logger.verbose(`deploy: deploy options : ${deployOptions}`);

        //retrieve metadata zip file path
        let metaZipLocation = await _retrieve(manifest, sourceOrgOauth);
        let metaZipBase64 = await zipUtil.readZipFrom(metaZipLocation, 'base64');

        if (checkOnly) deployOptions.checkOnly = true;

        await targetMeta.deployAndPoll(metaZipBase64, deployOptions);
    } catch (err) {
        logger.error('task deploy failed ' + err.message);
        return err;
    }
}

//exports
module.exports = {

    build: async function (manifest, currentUser, jobId) {
        logger.info(`build: build started by user ${currentUser.username} `);
        let job = jobs.findById(jobId);

        if (!job) {
            logger.debug('no job found with id '+jobId);
        }
        try {
            let sourceOrg = orgManager.multiModeOrg();
            let restApi = salesforce.rest(sourceOrg, currentUser.forceOauth);
            let sourceOrgName = manifest.source.org.orgId;
            let targetOrgName = manifest.target.org.orgId;
            let sourceOrgOauth;
            let targetOrgOauth;

            if (sourceOrgName == '__self__') {
                logger.info('build: source org is connected org');
                sourceOrgOauth = currentUser.forceOauth;
            } else {
                let sourceOrgData = await restApi.getOrg(sourceOrgName);
                sourceOrgOauth = await authManager.authenticateMultiModeOrg(org,
                    sourceOrgData.username__c,
                    sourceOrgData.password__c,
                    sourceOrgData.token__c
                );
            }

            logger.info(`build: target org in request : ${targetOrgName}`);

            //get target org from connected org
            let targetOrgData = await restApi.getOrg(targetOrgName);


            logger.debug('target ORG data : ', targetOrgData);

            let targetOrg = orgManager.multiModeOrg();

            targetOrgOauth = await targetOrg.authenticate({
                username: targetOrgData.get('username__c'),
                password: targetOrgData.get('password__c'),
                securityToken: targetOrgData.get('token__c'),
            });


            logger.info('targetOrgOauth authentication : ',
                (targetOrgOauth ? true : false)
            );

            logger.info('build task in request ', manifest.task);

            switch (manifest.task) {
                case 'retrieve':
                    _retrieve(manifest, sourceOrgOauth);
                    break;
                case 'deploy':
                    _deploy(manifest, sourceOrgOauth, targetOrgOauth)
                    break;
                case 'validate':
                    _deploy(manifest, sourceOrgOauth, targetOrgOauth,checkOnly = true);
                    break;

                default:
                    logger.error(`no such task ${manifest.task}`)
                    break;
            
            //task executed sucessfully
            if (jobId && job){
                jobs.updateStatus(jobId, 'successful');
            }
            }
        } catch (err) {
            logger.debug('build failed with errors: ',err);
            if(jobId && job) {
                jobs.updateStatus(jobId, 'failed');
            }
        }

    }
}