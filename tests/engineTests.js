var buildEngine = require('../core');
var assert = require('assert');
var joi = require('joi');


describe('Tests for core/engine', function () {


    //test #1
    describe("#engine.parseManifest", function () {
        it('should parse a valid build manifest', async () => {
            let goodManifest = {
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

            let valid = await buildEngine.parseManifest(goodManifest)
                .then((value) => { return true })
                .catch((err) => { console.log(err.message); return false; })
            assert.equal(true, valid);
        })
    });

})