import http from 'http';
import fs from 'fs';
import path from 'path';
import util from 'util';
import { app } from './app';

function setupLogging () {
    const logFile = fs.createWriteStream(path.join(__dirname, '../console.log'), { flags: 'a' });
    const logFileError = fs.createWriteStream(path.join(__dirname, '../console.error.log'), { flags: 'a' });
    const logStdout = process.stdout;

    function consoleToFile (d: any, type: string = 'info', color: string = '\x1b[0m', ...args: any[]) {
        const now = new Date();
        const argsStr = args.map((arg) => util.format(arg)).join(' ');
        if (process.env.NODE_ENV !== 'development') {
            logFile.write(`${now.toISOString()}\t[${type}]\t${util.format(d)}`);
            if (argsStr !== '') logFile.write(` ${argsStr}`);
            logFile.write('\n');
        }
        logStdout.write(`${color}[${type}]\x1b[0m\t${util.format(d)}`);
        if (argsStr !== '') logStdout.write(` ${argsStr}`);
        logStdout.write('\n');
    }

    console.log = (d, ...args) => { consoleToFile(d, 'info', '\x1b[0m', ...args); };
    console.info = (d, ...args) => { consoleToFile(d, 'info', '\x1b[0m', ...args); };
    console.warn = (d, ...args) => { consoleToFile(d, 'warn', '\x1b[33m', ...args); };
    console.debug = (d, ...args) => { consoleToFile(d, 'debug', '\x1b[90m', ...args); };

    console.error = function (d, ...args) {
        const now = new Date();
        const str = util.format(d);
        const argsStr = args.map((arg) => util.format(arg)).join(' ');
        if (process.env.NODE_ENV !== 'development') {
            logFile.write(`${now.toISOString()}\t[error]\t${str.split('\n')[0]}${str.split('\n').length > 1 || argsStr !== '' ? '…' : ''}\n`);
            logFileError.write(`${now.toISOString()}\n\n${str}`);
            if (argsStr !== '') logFileError.write(` ${argsStr}`);
            logFileError.write('\n\n====================\n\n');
        }
        logStdout.write(`\x1b[31m[error]\x1b[0m\t${str}`);
        if (argsStr !== '') logStdout.write(` ${argsStr}`);
        logStdout.write('\n');
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
