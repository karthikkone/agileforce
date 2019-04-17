const tokenManager = require('../tokenManager');

module.exports=authfilter;

function authfilter(req, res, next) {
    //read Authorization header
    let authHeader = req.get('Authorization');

    if (!authHeader) {
        return res.status(401).json({error: 'authorization missing'})
    }

    let authData = authHeader.split(' ');
    let authType = authData[0];
    let token = authData[1];

    if (authType != 'token') {
        return res.status(401).json({error: 'invalid authorzation type ',authType});
    }

    if (! token) {
        return res.status(401).json({error: 'authorization token missing'});
    }

    //header must be valid here
    try {
        let currentUser = tokenManager.verify(token);
        //set current user in request
        req.currentUser = currentUser;
        next();
    } catch(InvalidTokenError) {
        //signature verification failure
        return res.status(401).json({error: InvalidTokenError.message});
    }
}