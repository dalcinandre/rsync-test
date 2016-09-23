'use strict';

const exec = require('child_process').exec;
const cpus = require('os').cpus().length;
const async = require('async');

let host = '172.16.10.47';
let username = 'operador';
let source = '/cygdrive/d/aa/';
let destination = '/Users/operador/teste';
let timeToSearch = -60;
let canFind = true;

doFind();

setInterval(() => {
    if (canFind) {
        doFind();
    }
}, (timeToSearch * -1) * 10000);

function doFind() {
    async.queue((task, done) => {
        find((data) => {
            canFind = true;
            //console.log(data || 'Terminado sem nenhuma alteração no diretório!');
            done();
        })
    }, cpus).push();
}

function find(callback) {
    canFind = false;

    exec(`bash --login -c 'find ${source} -cmin ${timeToSearch} -type f'`, (error, stdout, stderr) => {
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
            exec(`bash --login -c 'rsync -rvh --ignore-existing ${files} ${username}@${host}:${destination}'`, (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                }

                console.log(stdout);
            });
        }

        callback();
    });
}