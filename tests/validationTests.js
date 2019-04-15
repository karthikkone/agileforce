var validations = require('../validations');
var assert = require('assert');
var joi = require('joi');


describe('Tests for validation schemas', function () {


    //test #1
    describe("#buildschema.validate", function () {
        it('should return true if required valid fields source and target are present', async () => {
            let goodObject = {
                source: {
                    org: {
                        orgId: 'ORG-000'
                    }
                },
                target: {
                    org: {
                        orgId: 'TAR-000',
                    }
                },

                tasks: 'retrieve',

                components: {
                    types: [
                        { name: 'ApexClass', members: ['hello', 'CustomController'] }
                    ]
                },
                tests: {
                    testLevel: 'RunSpecifiedTests',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(goodObject, validations.buildManifestSchema)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(true, valid);
        })
    });

    //test #2
    describe("#buildschema.validate", function () {
        it('should return false if required source field is invalid', async () => {
            let badObject = {
                source: {
                    org: {
                        orgId: 'ORG-000'
                    },
                    git: {
                        gitId: 'G000',
                        repository: 'https://github.com/repo',
                    }
                },
                target: {
                    org: {
                        orgId: 'TAR-000',
                    }
                },

                tasks: 'retrieve',

                components: {
                    types: [
                        { name: 'ApexClass', members: ['hello', 'CustomController'] }
                    ]
                },
                tests: {
                    testLevel: 'RunSpecifiedTests',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(badObject, validations.buildManifestSchema)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(false, valid);
        })
    });


    //test #7
    describe("#buildschema.validate", function () {
        it('should return true if source field is valid and is git', async () => {
            let badObject = {
                source: {
                    git: {
                        gitId: 'G000',
                        repository: 'https://github.com/repo',
                    }
                },
                target: {
                    org: {
                        orgId: 'TAR-000',
                    }
                },

                tasks: 'retrieve',

                components: {
                    types: [
                        { name: 'ApexClass', members: ['hello', 'CustomController'] }
                    ]
                },
                tests: {
                    testLevel: 'RunSpecifiedTests',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(badObject, validations.buildManifestSchema)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(true, valid);
        })
    });
})