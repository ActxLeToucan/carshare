import type express from 'express';
import fs from 'fs';
import { error, sendRaw } from '../tools/translator';

exports.getDocs = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (fs.existsSync('docs/out/index.html')) {
        res.sendFile('docs/out/index.html', { root: '.' });
    } else {
        sendRaw(req, res, error.documentation.notFound);
    }
}

exports.getDocsYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.download('docs/openapi.yaml', 'openapi.yaml');
}
