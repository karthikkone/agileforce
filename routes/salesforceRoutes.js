const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const authHelper = require('../services/authHelper');

function getAccessToken(req, res, next){
    var sfAuthPromise = authHelper.salesforceAuthorize(req.query.code);
    sfAuthPromise.then((authData)=>{
        console.log('SUCCESS oauth data ', authData);
        next();
    })
    .catch((err)=> {
        //delegate to express error handler
        console.log('error ocurred while authorizing with saleasforce ',err);
        throw new Error(JSON.stringify({status: 401, error: 'authorization failed'}));
    });
}

router.get('/callback', getAccessToken, function (req, res) {
    console.log('request successfully passed sf auth middleware to route');
    res.send("authorized");
});

router.get('/oauth', function (req, res) {
    res.redirect(authHelper.getSalesforceAuthUri());

});
module.exports = router;