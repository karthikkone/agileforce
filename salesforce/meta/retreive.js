module.exports = {

    retreiveAndPoll: function retrieveAndPoll(org, retrieveOptions, oauth = null) {
        if (!org) {
            return Promise.reject(new TypeError('org is required'));
        }
        if (!org.retrieveOptions) {
            return Promise.reject(new TypeError('retrieveOptions are required'));
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
    }
}