const db = require('../db');

//create 'users' collection to lokijs db
let _users = db.addCollection('users', {
    unique: ['username'],
    indices: ['username'],
});

//add a user an returns record id
function addUser(userSchema) {
    try {
        if (!userSchema.username) {
            throw new TypeError('UserSchema.username is required');
        }

        var newUser = _users.insert({
            username: userSchema.username,
            orgName: userSchema.orgName,
            forceOauth: userSchema.forceOauth,
        });
        return newUser.$loki;
    }
    catch (err) {
        console.log('failed to add user : ',err.message);
        return null;
    }
}

function findByUsername(username) {
    return _users.findOne({ username: username });
}

function findById(id) {
    return _users.findOne({$loki: id});    
}

function updateUser(userSchema) {
    if (!userSchema || !userSchema.username) {
        throw new TypeError('UserSchema & UserSchema.username are required');
    }
    try {
        return _users.update(userSchema);
    } catch(error) {
        console.log('failed to update user: ',error.message);
        return null;
    }
}

module.exports = {
    addUser: addUser,
    findByUsername: findByUsername,
    findById: findById,
    updateUser: updateUser,
}