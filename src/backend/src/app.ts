import express from 'express';
import { PrismaClient } from '@prisma/client';
import { error, sendMsg } from './messages';

const app = express();
app.use(express.json());

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`, { body: req.body });
    next();
});

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

/**
 * Force Prisma to try to connect to the database at each request.
 */
app.use((req, res, next) => {
    const prisma = new PrismaClient();
    prisma.$queryRaw`SELECT 1`
        .then(() => { next(); })
        .catch(() => {
            prisma.$connect()
                .then(() => { next(); })
                .catch((err) => {
                    console.error(err);
                    sendMsg(req, res, error.db.notReachable)
                });
        });
});

app.get('/', (req, res) => {
    res.redirect('/docs');
});

app.use('/docs', require('./routes/docs'));
app.use('/users', require('./routes/users'));
app.use('/admin', require('./routes/admin'));

export { app };
