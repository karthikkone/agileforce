const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const authHelper = require('../services/authHelper');



router.get('/callback', function(req, res) {
    
    var sfAuthPromise = authHelper.salesforceAuthorize(req.query.code);
    var statusCode; 
    sfAuthPromise.then((authData)=>{
        console.log('oauth data ',authData);
        ouath = authData;
        statusCode = 200;
    }).catch((err) => {
        statusCode = 401;
    });

    if (statusCode == 200) {
        res.status(200).json({message: 'authorized'});
    } else {
        res.status(401).json({error: 'unauthorized'});
    }
});

router.get('/oauth', function(req, res){
    res.redirect(authHelper.getSalesforceAuthUri());

});
module.exports = router;