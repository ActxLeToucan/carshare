import http from 'http';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { app } from './app';

if (process.env.NODE_ENV !== 'development') {
    const logFile = fs.createWriteStream(path.join(__dirname, '../console.log'), { flags: 'a' });
    const logFileError = fs.createWriteStream(path.join(__dirname, '../console.error.log'), { flags: 'a' });
    const logStdout = process.stdout;

    function consoleToFile (d: any, type: string = 'info') {
        const now = new Date();
        logFile.write(`${now.toISOString()}\t[${type}]\t${util.format(d)}\n`);
        logStdout.write(util.format(d) + '\n');
    }

    console.log = (d) => { consoleToFile(d, 'info'); };
    console.info = (d) => { consoleToFile(d, 'info'); };
    console.warn = (d) => { consoleToFile(d, 'warn'); };
    console.debug = (d) => { consoleToFile(d, 'debug'); };
    console.trace = (d) => { consoleToFile(d, 'trace'); };

    console.error = function (d) {
        const now = new Date();
        logFileError.write(`${now.toISOString()}\n\n${util.format(d)}\n\n====================\n\n`);
        logStdout.write(util.format(d) + '\n');
    };
}

console.log(`Environment: ${process.env.NODE_ENV ?? 'undefined'}`);

if (process.env.JWT_SECRET === undefined || process.env.JWT_SECRET === '' || process.env.JWT_SECRET === '<change_secret>') {
    console.error('JWT_SECRET environment variable is not set.');
    process.exit(1);
}

function normalizePort (val: string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }

    if (port >= 0) {
        return port;
    }

    return false;
}
const port = normalizePort(process.env.PORT ?? '3000');
app.set('port', port);

function errorHandler (error: NodeJS.ErrnoException) {
    if (error.syscall !== 'listen') {
        throw error;
    }
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + String(address) : 'port: ' + String(port);
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges.');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use.');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

const server = http.createServer(app);

server.on('error', errorHandler);
server.on('listening', () => {
    const address = server.address();
    const bind = typeof address === 'string' ? 'pipe ' + String(address) : 'port ' + String(port);
    console.log('Listening on ' + bind);
});

server.listen(port);
