import queueService from '@/lib/queue/index';

let workerInitialized = false;

if (!workerInitialized) {
    queueService
        .createWorker()
        .then(() => {
            console.log('✅ Worker initialized and listening for jobs...');
        })
        .catch(err => {
            console.error('❌ Failed to initialize worker:', err);
        });

    workerInitialized = true;
}
