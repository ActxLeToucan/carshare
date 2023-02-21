import fs from 'fs';
import path from 'path';
import util from 'util';

function setupLogging () {
    const logFile = fs.createWriteStream(path.join(__dirname, '../../console.log'), { flags: 'a' });
    const logFileError = fs.createWriteStream(path.join(__dirname, '../../console.error.log'), { flags: 'a' });
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
    console.error = (d, ...args) => {
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

export { setupLogging }
