'use strict';

const exec = require('child_process').exec;
const cpus = require('os').cpus().length;
const async = require('async');
const os = require('os');

let host = '172.16.10.47';
let username = 'operador';
let source = '/cygdrive/d/aa/';
let destination = '/Users/operador/teste';
let timeToSearch = -60;
let canFind = true;
let pid;

//doFind();

module.exports.setTimeToSearch = (time) => {
    this.timeToSearch = time || -60;
}

module.exports.setHost = (host) => {
    this.host = host || 'localhost';
}

module.exports.setUsername = (username) => {
    this.username = username || 'operador';
}

module.exports.setSource = (source) => {
    this.source = source;
}

module.exports.setDestination = (destination) => {
    this.destination = destination;
}

module.exports.start = () => {
    pid = setInterval(() => {
        if (canFind) {
            try {
                doFind();
            } catch (error) {
                throw error;
            }
        }
    }, (timeToSearch * -1) * 10000);
}

module.exports.stop = () => {
    if (pid) {
        try {
            clearInterval(pid);
        } catch (error) {
            throw error;
        }
    } else {
        return 'Nenhum serviço esta rodando!';
    }
}

function doFind() {
    async.queue((task, done) => {
        try {
            find((data) => {
                canFind = true;
                done();
            })
        } catch (error) {
            throw error;
        }
    }, os.cpus().length).push();
}

function find(callback) {
    canFind = false;

    let command = `find ${source} -cmin ${timeToSearch} -type f`;
    exec((os.platform() == 'win32') ? `C:\\cygwin64\\bin\\bash --login -c '${command}'` : command, (error, stdout, stderr) => {
        if (error) {
            console.error(error);
            throw error;
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
            exec((os.platform() == 'win32') ? `C:\\cygwin64\\bin\\bash --login -c '${command}'` : command, (error, stdout, stderr) => {
                if (error) {
                    console.error(error);
                    throw error;
                }

                console.log(stdout);
            });
        } else {
            console.log('Nenhum arquivo encontrado para envio até o momento!');
        }

        callback();
    });
}