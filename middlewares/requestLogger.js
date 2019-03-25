module.exports = function(req, res, next) {
    console.log(`${Date.now()} :: server recieved a ${req.method} request to ${req.path}`);
    next();
}