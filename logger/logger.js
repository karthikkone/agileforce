'use strict';

const config = require('../config');
const path = require('path')
const {createLogger, format, transports} = require('winston');

let logLevel = (config && config.app.logging.level ? config.app.logging.level : 'info')

const logger = createLogger({
    level : logLevel,
    format: format.combine(
        format.label({label: path.basename(process.mainModule.filename)}),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp}:${info.level} [${info.label}]: ${info.message}`)
    ),
    transports: [new transports.Console()]
});

module.exports=logger;