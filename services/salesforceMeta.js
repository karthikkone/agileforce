module.exports = {

    retreiveAndPoll: function retrieveAndPoll(org) {
        var retrievePromise = org.meta.retrieveAndPoll({
            apiVersion: '45.0',
            unpackaged: {
                version: '45.0',
                types: [
                    {
                        name: 'CustomObject',
                        members: ['*']
                    }
                ]
            }
        });

        retrievePromise.poller.on('poll', (pollRes) => { console.log('retrieve poll status: ', pollRes); })
        return retrievePromise;
    }

}