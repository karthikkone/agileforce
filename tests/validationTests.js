var validations = require('../validations');
var assert = require('assert');
var joi = require('joi');


describe('Tests for validation schemas', function () {
    //test #1
    describe('#sourceSchema.validate', function () {
        it('should return true for source object with only Org{..}', async () => {
            let goodObject = {
                org: {
                    orgId: 'ORG-0000',
                }
            }

            var valid = await joi.validate(goodObject, validations.sourceSchema)
                .then((value) => {
                    return true;
                })
                .catch((err) => { return false; })

            assert.equal(true, valid);
        })
    });

    //test #2
    describe('#sourceSchema.validate', function () {
        it('should return true for source object with only git{...}', async () => {
            let goodObject = {
                git: {
                    gitId: 'GIT-000',
                    repository: 'https://github.com/karthikkone/agileforce',
                },
            }

            var valid = await joi.validate(goodObject, validations.sourceSchema)
                .then((value) => {
                    return true;
                })
                .catch((err) => { console.log(err); return false; })

            assert.equal(true, valid);
        })
    });
    //test #3
    describe('#sourceSchema.validate', function () {
        it('should return false for source object with only git{...} but missing required fields', async () => {
            let badObject = {
                git: {
                    gitId: 'GIT-000',
                    //repository: 'https://github.com/karthikkone/agileforce', *required missing
                },
            }

            var valid = await joi.validate(badObject, validations.sourceSchema)
                .then((value) => {
                    return true;
                })
                .catch((err) => { console.log(err.message); return false; })

            assert.equal(false, valid);
        })
    });

    //test #4
    describe('#sourceSchema.validate', function () {
        it('should return false for source object with both org{...} & git{...} are present in JSON object, only either of two is allowed', async () => {
            let badObject = {
                org: {
                    orgId: 'ORG-000'
                },
                git: {
                    gitId: 'GIT-000',
                    repository: 'https://github.com/karthikkone/agileforce',
                },
            }

            var valid = await joi.validate(badObject, validations.sourceSchema)
                .then((value) => {
                    return true;
                })
                .catch((err) => { console.log(err.message); return false; })

            assert.equal(false, valid);
        })
    });

    //test #5
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
                    testLevel: 'specified',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(goodObject, validations.buildSchema)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(true, valid);
        })
    });

    //test #6
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
                    testLevel: 'specified',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(badObject, validations.buildSchema)
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
                    testLevel: 'specified',
                    specifiedTests: ['TestPage']
                }
            }

            let valid = await joi.validate(badObject, validations.buildSchema)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(true, valid);
        })
    });
})