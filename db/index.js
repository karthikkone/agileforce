const config = require('../config');
const loki = require('lokijs');

let db;
let dbname = config.app.db.name;

if (dbname) {
    console.log(`creating database ${config.app.db.name}`);
    db = new loki(dbname);
} else {
    console.error('no database name found in config');
}

module.exports = db;