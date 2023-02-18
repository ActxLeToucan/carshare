import type express from 'express';
import fs from 'fs';

exports.getDocs = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (fs.existsSync('docs/out/index.html')) {
        res.sendFile('docs/out/index.html', { root: '.' });
    } else {
        res.status(404).send('<h1>Documentation not found</h1>' +
            '<p>If your are the owner of the server, run "npm run docs" to generate it.</p>' +
            '<p>You can also find the documentation file (YAML) <a href="/docs/yaml">here</a>.</p>');
    }
}

exports.getDocsYaml = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.download('docs/openapi.yaml', 'openapi.yaml');
}
