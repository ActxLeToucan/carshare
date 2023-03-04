import express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, sendMsg } from './tools/translator';
import auth from './middlewares/auth';

const dbNeeded = require('./middlewares/dbNeeded');
const emailVerified = require('./middlewares/emailVerified');
const admin = require('./middlewares/admin');

const prisma = new PrismaClient({ errorFormat: 'pretty' });

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    process.env.NODE_ENV === 'development'
        ? console.log(`${req.method} ${req.url}`, { body: req.body })
        : console.log(`${req.method} ${req.url}`); // don't log the body in production to avoid leaking sensitive data
    next();
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.get('/', (req, res) => {
    res.redirect('/docs');
});

app.use('/docs', require('./routes/docs'));
app.use('/users', dbNeeded, require('./routes/users'));
app.use('/admin', dbNeeded, auth.access, emailVerified, admin, require('./routes/admin'));
app.use('/travels', dbNeeded, require('./routes/travels'));
app.use('/notifications', dbNeeded, require('./routes/notifications'));
app.use('/settings', dbNeeded, require('./routes/settings'));

app.use((req, res) => {
    sendMsg(req, res, error.generic.routeNotFound);
});

export { app, prisma };
