const express = require('express');
const jobs = require('../models/job');

const router = express.Router();

router.get('/:jobId/status', (req, res)=>{
    var jobId = req.params.jobId;
    if (!jobId) {
        return res.status(402).json({error: 'invalid request jobId required'});
    } else {
        let job = jobs.findById(jobId);
        if (!job) {
            return res.status(404).json({error: `no job found with Id: ${jobId}`});
        }

        return res.status(200).json({status:job.status, jobId: jobId});
    }
});