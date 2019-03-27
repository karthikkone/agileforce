const express = require('express');
const router = express.Router();
const config = require('../config/config');
const nforce = require('nforce');
const authHelper = require('../services/authHelper');

router.use('/callback', function(req, res, next){
    var sfAuthPromise = authHelper.salesforceAuthorize(req.query.code);
    sfAuthPromise.then((authData)=>{
        console.log('SUCCESS oauth data ', authData);
        next();
    })
    .catch((err)=> {
        //delegate to express error handler
        throw new Error(JSON.stringify({status: 401, error: 'authorization failed'}));
    });
}
);

router.get('/callback', function (req, res) {
    console.log('request successfully passed sf auth middleware to route /callback');
    res.status(200).json({status: 200, message:'authorization succeded'});
});

router.get('/oauth', function (req, res) {
    res.redirect(authHelper.getSalesforceAuthUri());

});
module.exports = router;