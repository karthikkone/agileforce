module.exports = {
    updateBuild: function (org,existingBuild, oauth = null) {
        let dmlOptions = {};
        if (!org) {
            return Promise.reject(new TypeError('Org is not defined'));
        }
        //oauth is required in multi mode org
        if (org.mode == 'multi' && oauth == null) {
            return Promise.reject(new TypeError('oauth is required in multi mode'));
        }

        if (org.mode == 'multi') {
            //add oauth in dml options
            dmlOptions.oauth = oauth;
        }

        if (existingBuild != null) {
            //existing sobject queried from REST api
            dmlOptions.sobject = existingBuild;
        } else {
            //can't proceed
            return Promise.reject(new TypeError('existingBuild is missing'))
        }

        //insert or update record
        return new Promise((resolve, reject) => {
            console.log('updating Build object')
            org.update(dmlOptions, (err, resp) => {
                if (!err) {
                    console.log(err);
                    reject(err);
                } else {
                    console.log('Build updated');
                    resolve(true);
                }
            });
        });
    }
}