const joi = require('joi');

const testLevels = {
    LOCAL: 'RunLocalTests',
    ALL: 'RunAllTestsInOrg',
    SPECIFIED: 'RunSpecifiedTests',
    SKIPTESTS: 'NoTestRun'
}

const tasks = {
    RETRIEVE: 'retrieve',
    DEPLOY: 'deploy',
    VALIDATE: 'validate',
    UNDEPLOY: 'undeploy',
}

//nested schemas
const gitSchema = joi.object({
    gitId: joi.string().required(),
    repository: joi.string().uri({
        scheme: ['http', 'https']
    }).required(),

    branch: joi.string(),
    pullRequest: joi.string(),
});

const orgSchema = joi.object({
    orgId: joi.string().required(),
});

const sourceSchema = joi.object({
    org: orgSchema,
    git: gitSchema,
}).xor('org', 'git').required();

const targetSchema = joi.object({
    org: orgSchema,
}).required();

const typeSchema = joi.object({
    name: joi.string().required(),
    members: joi.array().items(joi.string())
        .min(1)
        .required(),
}).required();

const componentSchema = joi.object({
    package: joi.string(),
    types: joi.array().items(typeSchema)
        .min(1)
        .required(),
    exclusions: joi.array().items(joi.string()),
}).required();

const testSchema = joi.object({
    testLevel: joi.string().valid(testLevels.LOCAL,
        testLevels.ALL,
        testLevels.SPECIFIED,
        testLevels.SKIPTESTS)
        .required(),

    specifiedTests: joi.array().items(joi.string())
}).required();

const tasksSchema = joi.string().valid(tasks.RETRIEVE,
    tasks.VALIDATE,
    tasks.DEPLOY,
    tasks.UNDEPLOY)
    .required();


const buildName = joi.string().required();

//manifest schema used to parse request body
const buildManifestSchema = joi.object({
    source: sourceSchema,
    target: targetSchema,
    buildName: buildName,
    task: tasksSchema,
    components: componentSchema,
    tests: testSchema,
    rollbackOnError: joi.boolean()
})

module.exports = {
    sourceSchema: sourceSchema,
    componentSchema: componentSchema,
    testSchema: testSchema,
    targetSchema: targetSchema,
    typeSchema: typeSchema,
    buildManifestSchema: buildManifestSchema,
    manifestTestLevels: testLevels,
    manifestTasks: tasks,

}