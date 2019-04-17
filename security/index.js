const accessTokens = require('./tokenManager');
const userRegistry = require('./userRegistry');
const authFilter = require('./middleware/authFilter')
module.exports = {
    access: accessTokens,
    auth: userRegistry,
    authFilter: authFilter,
}