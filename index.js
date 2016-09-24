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

    /*cluster.on('online', function (worker) {
        console.log('Worker ' + worker.process.pid + ' is online');
    });*/

    cluster.on('exit', (worker, code, pid) => {
        console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal);
        console.log('Starting a new worker');
        cluster.fork();
    });
} else {
    const express = require('express');
    // const http = require('http');
    const bp = require('body-parser');
    const finder = require('./src/finder');

    let app = express();
    app.use(bp.json());

    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    });

    app.get('/time/:time', (req, res) => {
        finder.setTimeToSearch(req.params.time);
        return res.status(200).send(`Tempo de busca setado para ${req.params.time}`);
    });

    app.get('/stop', (req, res) => {
        try {
            let t = finder.stop();
            return res.status(200).send(t || 'Serviço de busca terminado com sucesso!');
        } catch (error) {
            return res.status(500).send(error);
        }
    });

    let server = app.listen(8080, () => {
        console.log(`Processo ${process.pid} esta rodando e aceitando conexões na porta ${server.address().port}`);
    });

}
