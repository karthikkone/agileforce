const request = require('request');
const fs = require('fs');
const express = require('express');
const config = require('./config/config');
const bodyParser = require('body-parser');
//routes
const salesforceRoutes = require('./routes/salesforceRoutes');

//middlewares
const requestLogger = require('./middlewares/requestLogger');
const authFilter = require('./middlewares/authfilter');

const app = express();
const port = config.app.port;

//static content
app.use(express.static('public'));

//add support for json & url encoded bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

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