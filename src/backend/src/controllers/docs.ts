import type express from 'express';

exports.getDocs = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.sendFile('docs/index.html', { root: '.' });
}

exports.getDocsYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.download('docs/openapi.yaml', 'openapi.yaml');
}

exports.getFavicon = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (process.env.FRONTEND_LOGO === undefined) res.sendStatus(404);
    else res.redirect(process.env.FRONTEND_LOGO);
}
