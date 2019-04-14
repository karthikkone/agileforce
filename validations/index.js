const buildschemas = require('./buildRequestSchema');

module.exports = {
    targetSchema: buildschemas.targetSchema,
    componentSchema : buildschemas.componentSchema,
    sourceSchema: buildschemas.sourceSchema,
    testSchema: buildschemas.testSchema,
    buildSchema: buildschemas.buildSchema,
};