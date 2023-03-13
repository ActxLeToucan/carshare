import type express from 'express';
import { error, sendMsg } from '../tools/translator';

exports.getDocs = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.sendFile('docs/index.html', { root: '.' });
}

exports.getDocsYaml = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    res.download('docs/openapi.yaml', 'openapi.yaml');
}

exports.getFavicon = (req: express.Request, res: express.Response, _: express.NextFunction) => {
    if (process.env.FRONTEND_LOGO === undefined) sendMsg(req, res, error.documentation.favicon);
    else res.redirect(process.env.FRONTEND_LOGO);
}
