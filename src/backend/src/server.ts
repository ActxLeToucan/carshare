import http from 'http';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { app } from './app';

function setupLogging () {
    const logFile = fs.createWriteStream(path.join(__dirname, '../console.log'), { flags: 'a' });
    const logFileError = fs.createWriteStream(path.join(__dirname, '../console.error.log'), { flags: 'a' });
    const logStdout = process.stdout;

    function consoleToFile (d: any, type: string = 'info', color: string = '\x1b[0m') {
        const now = new Date();
        if (process.env.NODE_ENV !== 'development')logFile.write(`${now.toISOString()}\t[${type}]\t${util.format(d)}\n`);
        logStdout.write(`${color}[${type}]\x1b[0m\t${util.format(d)}\n`);
    }

    console.log = (d) => { consoleToFile(d); };
    console.info = (d) => { consoleToFile(d); };
    console.warn = (d) => { consoleToFile(d, 'warn', '\x1b[33m'); };
    console.debug = (d) => { consoleToFile(d, 'debug', '\x1b[90m'); };

    console.error = function (d) {
        const now = new Date();
        if (process.env.NODE_ENV !== 'development') logFileError.write(`${now.toISOString()}\n\n${util.format(d)}\n\n====================\n\n`);
        logStdout.write(`\x1b[31m[error]\x1b[0m\t${util.format(d)}\n`);
    };
}
setupLogging();

if (process.env.NODE_ENV === undefined || process.env.NODE_ENV === '') {
    console.warn('NODE_ENV environment variable is not set.');
} else {
    console.log('Environment: ' + process.env.NODE_ENV);
}

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
