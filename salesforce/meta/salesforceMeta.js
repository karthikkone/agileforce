module.exports = {

    retreiveAndPoll: function retrieveAndPoll(org, retrieveOptions, oauth=null) {
        if (!org) {
            Promise.reject(new TypeError('org is required'));
        }
        if (!org.retrieveOptions) {
            Promise.reject(new TypeError('retrieveOptions are required'));
        }
        if (org.mode == 'multi' && !oauth) {
            Promise.reject(new TypeError('oauth is required for a multi mode org'));
        }

        if (org.mode == 'multi') {
            retrieveOptions.oauth = oauth;
        }

        var retrievePromise = org.meta.retrieveAndPoll(retrieveOptions);
        retrievePromise.poller.on('poll', (pollRes) => { console.log('retrieve poll status: ', pollRes); })
        return retrievePromise;
    },

    validateAndPoll: function validateAndPoll(org,metaZipFile,deployOptions,oauth=null) {
        let opts = {};
        if (!org) {
            Promise.reject(new TypeError('org is required'));
        }
        if (!org.deployOptions) {
            Promise.reject(new TypeError('retrieveOptions are required'));
        }
        if (org.mode == 'multi' && !oauth) {
            Promise.reject(new TypeError('oauth is required for a multi mode org'));
        }

        if (!metaZipFile) {
            Promise.reject(new TypeError('metaZipFile is required'));
        }

        if (org.mode == 'multi') {
            opts.oauth = oauth;
        }
        opts.zipFile = metaZipFile;
        opts.deployOptions = deployOptions;

        var validatePromise = org.meta.deployAndPoll(opts);

        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    },

    validateTestAndPoll: function validateTestAndPoll(org,metaZipFile,deployOptions,oauth=null) {
        let opts = {};
        if (!org) {
            Promise.reject(new TypeError('org is required'));
        }
        if (!org.deployOptions) {
            Promise.reject(new TypeError('retrieveOptions are required'));
        }
        if (org.mode == 'multi' && !oauth) {
            Promise.reject(new TypeError('oauth is required for a multi mode org'));
        }

        if (!metaZipFile) {
            Promise.reject(new TypeError('metaZipFile is required'));
        }

        if (org.mode == 'multi') {
            opts.oauth = oauth;
        }
        opts.zipFile = metaZipFile;
        opts.deployOptions = deployOptions;

        var validatePromise = org.meta.deployAndPoll(opts);
        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    }
}