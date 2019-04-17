const jwt = require('jsonwebtoken');
const users = require('../models/user');
const config = require('../config');

function createJWT(userSchema) {
    if (!userSchema.username || !userSchema.forceOauth) {
        throw new TypeError('UserSchema.username & UserSchema.forceOauth are required');
    }
    let u = users.findByUsername(userSchema.username);
    if (!u) {
        throw new Error('User not found');
    }
    let token = jwt.sign({id: u.$loki},config.security.jwt.secret);
    return token;
}

function verifyJWT(token) {
    try {
        let decoded = jwt.verify(token,config.security.jwt.secret);
        let userId = decoded.id;
        return users.findById(userId);
    } catch(err) {
        throw new Error(err);
    }
}


module.exports = {
    issue: createJWT,
    verify: verifyJWT, 
}