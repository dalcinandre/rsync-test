'use strict';

const exec = require('child_process').exec;
const Rsync = require('rsync');
const cpus = require('os').cpus().length;
const async = require('async');

let queues = async.queue((task, done) => {
    find((data) => {
        console.log(data);
        done();
    })
}, cpus);

queues.push();

let host = '172.16.10.47';
let username = 'operador';
let source = './a';
let destination = '/Users/operador/teste';
let timeToSearch = -60;

let rsync = new Rsync()
    .shell(`ssh`)
    .flags('rv')
    .set('ignore-existing')
    .destination(`${username}@${host}:${destination}`);

function find(callback) {
    exec(`find ${source} -cmin ${timeToSearch} -type f`, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
        }

        let files = stdout.split('\n');
        files.splice(files.length - 1, 1);

        rsync.source(files).execute((error, code, cmd) => {

            if (error) {
                console.error(error, cmd);
            }

            callback(files);
        });
    });
}