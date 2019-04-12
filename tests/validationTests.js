var validations = require('../validations');
var assert = require('assert');
var joi = require('joi');

//test #1
describe('Tests for validation schemas', function () {
    describe('#sourceSchema.validate', function () {
        it('should return true for source object with only Org{..}', async () => {
            let goodObject = {
                org: {
                    orgId: 'ORG-0000',
                }
            }

            var valid = await joi.validate(goodObject, validations.buildRequestSchema)
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
                    git : {
                        gitId: 'GIT-000',
                        repository: 'https://github.com/karthikkone/agileforce',
                    },
            }

            var valid = await joi.validate(goodObject, validations.buildRequestSchema)
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
                    git : {
                        gitId: 'GIT-000',
                        //repository: 'https://github.com/karthikkone/agileforce', *required missing
                    },
            }

            var valid = await joi.validate(badObject, validations.buildRequestSchema)
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
                    git : {
                        gitId: 'GIT-000',
                        repository: 'https://github.com/karthikkone/agileforce',
                    },
            }

            var valid = await joi.validate(badObject, validations.buildRequestSchema)
                .then((value) => {
                   return true;
                })
                .catch((err) => { console.log(err.message); return false; })
            
            assert.equal(false, valid);
        })
    });
    
})