const joi = require('joi');

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
    members: joi.array().items(joi.string()).min(1).required(),
}).required();

const componentSchema = joi.object({
    package: joi.string(),
    types: joi.array().items(typeSchema).min(1).required(),
    exclusions: joi.array().items(joi.string()),
}).required();

const testSchema = joi.object({
            testLevel: joi.string().valid('local', 'all', 'specified', 'skipTests').required(),
            specifiedTests: joi.array().items(joi.string())
}).required();

const tasksSchema = joi.string().valid('retrieve', 'validate','deploy').required();

const buildRequestSchema = joi.object({
    source: sourceSchema,
    target: targetSchema,
    tasks: tasksSchema,
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
    buildSchema: buildRequestSchema,
}