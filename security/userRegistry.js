const users = require('../models/user');

function isRegisteredUser(username) {
    try {
        let u = users.findByUsername(username);
        if (!u) {
            console.log('no user found by username: ',username);
            return false;
        }
        return true;
    } catch(error) {
        //data access errors
        throw new Error(error);
    } 
}

function registerUser(username,forceOauth) {
    let newRegUser = {
        username: username,
        orgName: null,
        forceOauth: forceOauth,
    }

    var _saved = users.addUser(newRegUser);
    if (!_saved) throw new Error('failed to register user');
}

module.exports = {
    isRegisteredUser: isRegisteredUser,
    registerUser: registerUser,
}