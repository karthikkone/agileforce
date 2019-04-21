module.exports = {
    validateAndPoll: function validateAndPoll(org,metaZipFile,deployOptions,oauth=null) {
        let opts = {};
        if (!org) {
            return Promise.reject(new TypeError('org is required'));
        }
        if (!org.deployOptions) {
            return Promise.reject(new TypeError('deployOptions are required'));
        }
        if (org.mode == 'multi' && !oauth) {
            return Promise.reject(new TypeError('oauth is required for a multi mode org'));
        }
    
        if (!metaZipFile) {
            return Promise.reject(new TypeError('metaZipFile is required'));
        }
    
        if (org.mode == 'multi') {
            opts.oauth = oauth;
        }
        opts.zipFile = metaZipFile;
        //ensure checkOnly is true for validate
        deployOptions.checkOnly = true;
        opts.deployOptions = deployOptions;
    
        var validatePromise = org.meta.deployAndPoll(opts);
    
        validatePromise.poller.on('poll', (pollRes) => {console.log('validate poll status: ',pollRes);})
        validatePromise.poller.on('done', (pollRes) => {console.log('validate complete: ',pollRes);})
        return validatePromise;
    }
}