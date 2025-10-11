import cron from 'node-cron';
import { processSLAUpdates } from './slaService.js';

class SchedulerService {
    constructor() {
        this.jobs = new Map();
    }

    // Initialize all scheduled jobs
    init() {
        console.log('[Scheduler] Initializing scheduled jobs...');
        
        // SLA Processing - runs every 10 minutes
        this.scheduleSLAProcessing();
        
        console.log('[Scheduler] All jobs scheduled successfully');
    }

    scheduleSLAProcessing() {
        // Run every 10 minutes
        const job = cron.schedule('*/10 * * * *', async () => {
            try {
                console.log('[Scheduler] Running SLA processing job...');
                const result = await processSLAUpdates();
                console.log('[Scheduler] SLA processing completed:', result);
            } catch (error) {
                console.error('[Scheduler] SLA processing job failed:', error);
            }
        }, {
            scheduled: false, // Don't start immediately
            timezone: 'UTC'
        });

        this.jobs.set('slaProcessing', job);
        job.start();
        console.log('[Scheduler] SLA processing job scheduled (every 10 minutes)');
    }

    // Manual trigger for SLA processing
    async triggerSLAProcessing() {
        try {
            console.log('[Scheduler] Manual SLA processing triggered...');
            const result = await processSLAUpdates();
            console.log('[Scheduler] Manual SLA processing completed:', result);
            return result;
        } catch (error) {
            console.error('[Scheduler] Manual SLA processing failed:', error);
            throw error;
        }
    }

    // Stop a specific job
    stopJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.stop();
            console.log(`[Scheduler] Job '${jobName}' stopped`);
            return true;
        }
        console.warn(`[Scheduler] Job '${jobName}' not found`);
        return false;
    }

    // Start a specific job
    startJob(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            job.start();
            console.log(`[Scheduler] Job '${jobName}' started`);
            return true;
        }
        console.warn(`[Scheduler] Job '${jobName}' not found`);
        return false;
    }

    // Get job status
    getJobStatus(jobName) {
        const job = this.jobs.get(jobName);
        if (job) {
            return {
                name: jobName,
                running: job.running || false,
                scheduled: true
            };
        }
        return null;
    }

    // Get all jobs status
    getAllJobsStatus() {
        const status = {};
        for (const [name, job] of this.jobs) {
            status[name] = {
                running: job.running || false,
                scheduled: true
            };
        }
        return status;
    }

    // Stop all jobs (useful for graceful shutdown)
    stopAll() {
        console.log('[Scheduler] Stopping all scheduled jobs...');
        for (const [name, job] of this.jobs) {
            job.stop();
            console.log(`[Scheduler] Stopped job: ${name}`);
        }
    }
}

// Create singleton instance
const schedulerService = new SchedulerService();

export default schedulerService;