const accessTokens = require('./tokenManager');
const userRegistry = require('./userRegistry');

module.exports = {
    access: accessTokens,
    auth: userRegistry,
}