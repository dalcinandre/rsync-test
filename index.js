'use strict';

const cluster = require('cluster');
const cpus = require('os').cpus().length;

if (cluster.isMaster) {

    console.log('Master cluster setting up ' + cpus + ' workers...');

    for (var i = 0; i < cpus; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });

    cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('exit', (worker, code, pid) => {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    const Rsync = require('rsync');
    const chokidar = require('chokidar');

    let rsync = new Rsync()
        .shell('ssh')
        .flags('avh')
        .source('./a/*')
        .destination('./b/');

    chokidar.watch('./a', { ignored: /[\/\\]\./ }).on('all', (event, path) => {
        rsync.execute((error, code, cmd) => {
            if (error) {
                console.error(error);
            }
            console.log(code, cmd);
        });
    });
}
