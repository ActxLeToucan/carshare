import type express from 'express';
import * as properties from '../properties';

/**
 * Gets pagination query params in the request and returns an object with those values.
 * Offset is a positive number, default to 0.
 * Limit is a number between [{@link properties.p.query.minLimit}...{@link properties.p.query.maxLimit}], default {@link properties.p.query.maxLimit}.
 * @param req The express request.
 */
function getPagination (req: express.Request): { limit: number, offset: number } {
    const offset = Number.isNaN(Number(req.query.offset)) ? 0 : Math.max(0, Number(req.query.offset)); // default 0, min 0
    const limit = Number.isNaN(Number(req.query.limit))
        ? properties.p.query.maxLimit // default
        : Math.min(properties.p.query.maxLimit,
            Math.max(properties.p.query.minLimit, Number(req.query.limit))
        ); // default max, min p.query.minLimit, max p.query.maxLimit

    return { limit, offset };
}

export { getPagination };
