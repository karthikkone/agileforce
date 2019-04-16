module.exports = {

    retreiveAndPoll: function retrieveAndPoll(org, retrieveOptions) {
        var retrievePromise = org.meta.retrieveAndPoll(retrieveOptions);
        retrievePromise.poller.on('poll', (pollRes) => { console.log('retrieve poll status: ', pollRes); })
        return retrievePromise;
    },

    validateAndPoll: function validateAndPoll(org,metaZipFile,deployOptions) {
        var validatePromise = org.meta.deployAndPoll({
            zipFile: metaZipFile,
            deployOptions: deployOptions,
        });

        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    },

    validateTestAndPoll: function validateTestAndPoll(org,metaZipFile,deployOptions) {
        var validatePromise = org.meta.deployAndPoll({
            zipFile: metaZipFile,
            deployOptions: deployOptions,
        });

        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    }
}