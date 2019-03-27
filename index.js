const request = require('request');
const fs = require('fs');
const express = require('express');
const config = require('./config/config');

//routes
const salesforceRoutes = require('./routes/salesforceRoutes');

//middlewares
const requestLogger = require('./middlewares/requestLogger');
const authFilter = require('./middlewares/authfilter');

const app = express();
const port = config.app.port;


//home
app.get('/',(request, response) => {
    response.send('hello from express');
}); 

app.use('/sforce',salesforceRoutes);

app.listen(port, (err)=> {
    if (err) {
        console.log('failed to start server ...', err);
        return err;
    }
    console.log(`server is listenining on ${port}`);

});

//exit on unhandeled errors
process.on('uncaughtException', (error)=>{
    console.log(error);
    console.log('shutting down application ...');
    process.exit(1)
});