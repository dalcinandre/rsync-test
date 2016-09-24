'use strict';

const exec = require('child_process').exec;
const cpus = require('os').cpus().length;
const async = require('async');
const os = require('os');

let host = '172.16.10.47';
let username = 'operador';
let source = './a/';
let destination = '/Users/operador/teste';
let timeToSearch = -60;
let canFind = true;

doFind();

let pid = setInterval(() => {
    if (canFind) {
        doFind();
    }
}, (timeToSearch * -1) * 10000);

//console.log(pid);

function doFind() {
    async.queue((task, done) => {
        find((data) => {
            canFind = true;
            done();
        })
    }, os.cpus().length).push();
}

function find(callback) {
    canFind = false;

    let command = `find ${source} -cmin ${timeToSearch} -type f`;
    exec((os.platform() == 'win32') ? `C:\\cygwin64\\bin\\bash --login -c ${command}` : command, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
        }

        let files = stdout.split('\n');

        files = files.map(file => {
            if (file.trim() != '') {
                return '"' + file + '"';
            }
        });

        files = files.join(' ');

        if (stdout) {
            let command = `rsync -rvh --ignore-existing ${files} ${username}@${host}:${destination}`;
            exec((os.platform() == 'win32') ? `C:\\cygwin64\\bin\\bash --login -c ${command}` : command, (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                }

                console.log(stdout);
            });
        }

        callback();
    });
}