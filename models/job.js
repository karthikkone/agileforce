const db = require('../db');

//create 'users' collection to lokijs db
let _jobs = db.addCollection('jobs',{
    indices: ['buildId'],
});

function addJob(buildId,status='In progress') {
   var result =  _jobs.insert({buildId:buildId,status:status});
   return result.$loki;
}

function findById(jobId) {
    if (!jobId) {
        throw new TypeError('jobId is required');
    }
    let job = _jobs.findOne({$loki: jobId});
    return job;
}

function updateStatus(jobId, status) {
    if (!jobId) {
        throw new TypeError('jobId is required');
    }

    let job = _jobs.findOne({$loki: jobId});
    
    //update if found
    if (job) {
        job.status = status;
        _jobs.update(job);
    }
}

module.exports={
    addJob: addJob,
    findById: findById,
    updateStatus: updateStatus,
}