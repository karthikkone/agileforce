var meta = require('./meta');
var rest = require('./rest');
var auth = require('./auth/authManager');

module.exports = {
    meta: meta,
    rest: rest,
    auth: auth,
}