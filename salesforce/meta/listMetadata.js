module.exports = {

    listMetadata: function listMetadata(org, queryOptions,oauth = null) {
        if (!org) {
            return Promise.reject(new TypeError('org is required'));
        }
        if (!queryOptions) {
            return Promise.reject(new TypeError('queryOptions are required'));
        }
        if (!queryOptions.queries) {
            return Promise.reject(new TypeError('queryOptions.queries is required'));
        }
        if (org.mode == 'multi' && !oauth) {
            Promise.reject(new TypeError('oauth is required for a multi mode org'));
        }

        if (org.mode == 'multi') {
            queryOptions.oauth = oauth;
        }
        
        return org.meta.listMetadata(queryOptions);
    }
}