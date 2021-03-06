module.exports = {
    deployAndPoll: function validateAndPoll(org,metaZipFile,deployOptions,oauth=null) {
        let opts = {};
        if (!org) {
            return Promise.reject(new TypeError('org is required'));
        }
        if (!deployOptions) {
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
        opts.deployOptions = deployOptions;
    
        var validatePromise = org.meta.deployAndPoll(opts);
    
        validatePromise.poller.on('poll', (pollRes) => {
            console.log('validate poll status: ',pollRes);
            
        });

        validatePromise.poller.on('done', (pollRes) => {
            console.log('validate complete: ',pollRes);
        });

        validatePromise.poller.on('error', (pollRes) => {
            console.log('validate complete: ',pollRes);
        });

        return validatePromise;
    }
}