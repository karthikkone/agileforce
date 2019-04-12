module.exports = {

    retreiveAndPoll: function retrieveAndPoll(org, retrieveOptions) {
        var retrievePromise = org.meta.retrieveAndPoll({
            apiVersion: '45.0',
            unpackaged: {
                version: '45.0',
                types: [
                    {name: 'CustomObject', members: ['*']},
                    {name: 'ApexClass', members: ['MyFooController','MyFooControllerTest']}
                ]
            }
        });

        retrievePromise.poller.on('poll', (pollRes) => { console.log('retrieve poll status: ', pollRes); })
        return retrievePromise;
    },

    validateAndPoll: function validateAndPoll(org,metaZipFile,checkOnly="true") {
        var validatePromise = org.meta.deployAndPoll({
            zipFile: metaZipFile,
            deployOptions: {
                checkOnly : checkOnly,
                runTests: ['MyFooControllerTest']
            }
        });

        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    }
}