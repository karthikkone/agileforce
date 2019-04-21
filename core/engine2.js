const express = require('express');

const config = require('../config');
const nforce = require('nforce');
const path = require('path');
const salesforce = require('../salesforce');
const zipUtil = require('../utils').zipUtil;
const orgManager = require('../org');


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


async function build(manifest, currentUser) {
    let retrieveOptions = _parseRetrieveOptions(manifest);
    let deployOptions = _parseDeployOptions(manifest);

    let sourceOrgName = manifest.source.org.orgId;
    let targetOrgName = manifest.target.org.orgId;
    let sourceOrgAuth;

    let connectedOrg = orgManager.multiModeOrg();
    let sourceOrg = orgManager.multiModeOrg();
    let targetOrg = orgManager.multiModeOrg();
    let targetOrgAuth;

    
    try {
        if (sourceOrgName == '__self__') {
            sourceOrgAuth = currentUser.forceOauth;
        } else {
            console.log('finding source org : ',sourceOrgName);
            let sourceOrgData = await salesforce.rest(connectedOrg, currentUser.forceOauth)
                .getOrg(sourceOrgName);

            //connect to source org
            sourceOrgAuth = await sourceOrg.authenticate({
                username: sourceOrgData.username__c,
                password: sourceOrgData.password__c,
                securityToken: sourceOrgData.token__c,
            });
        }

        //get target org data
        let targetOrgData = await salesforce.rest(sourceOrg, sourceOrgAuth)
        .getOrg(targetOrgName);

        console.log('found target org ',JSON.stringify(targetOrgData));
        //connect to target org
        targetOrgAuth = await targetOrg.authenticate({
            username: targetOrgData.username__c,
            password: targetOrgData.password__c,
            securityToken: targetOrgData.token__c,
        });

        console.log('target : ' ,targetOrgAuth);

    } catch (err) {
        console.log('build failed ' , err);
    }
}

module.exports = {
    build: build,
}