const buildschemas = require('./buildManifestSchema');

module.exports = {
    targetSchema: buildschemas.targetSchema,
    componentSchema : buildschemas.componentSchema,
    sourceSchema: buildschemas.sourceSchema,
    testSchema: buildschemas.testSchema,
    buildManifestSchema: buildschemas.buildManifestSchema,

    buildManifest : {
        schema: buildschemas.buildManifestSchema,
        props: {
            tasks: buildschemas.manifestTasks,
            testLevels: buildschemas.manifestTestLevels,
        }
    }
};