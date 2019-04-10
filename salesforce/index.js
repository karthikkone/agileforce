var meta = require('./meta/salesforceMeta');
var rest = require('./rest/salesforceDataManager');
var auth = require('./auth/authManager');

module.exports = {
    meta: meta,
    rest: rest,
    auth: auth,
}