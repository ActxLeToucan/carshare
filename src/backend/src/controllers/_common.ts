import type express from 'express';
import properties from '../properties';

/**
 * Gets pagination query params in the request and returns an object with those values after sanitization.
 * Offset is a positive number, default to 0.
 * Limit is a number between [{@link properties.p.query.minLimit}...{@link properties.p.query.maxLimit}], default {@link validator.ts.p.query.maxLimit}.
 * @param req The express request.
 */
function getPagination (req: express.Request): { limit: number, offset: number } {
    const offset = Number.isNaN(Number(req.query.offset)) ? 0 : Math.max(0, Number(req.query.offset)); // default 0, min 0
    const limit = Number.isNaN(Number(req.query.limit))
        ? properties.query.defaultLimit
        : Math.min(properties.query.maxLimit,
            Math.max(properties.query.minLimit, Number(req.query.limit))
        ); // default p.query.defaultLimit, min p.query.minLimit, max p.query.maxLimit

    return { limit, offset };
}

/**
 * Prepares pagination for a query.
 * @param req Express request
 * @param searchMode If true, the query is returned.
 * @returns An object with the query, pagination params and a function to create the response.
 */
function preparePagination (req: express.Request, searchMode: boolean) {
    const pagination = getPagination(req);

    const q = req.query.query;
    const query = q === undefined ? undefined : String(q).trim();

    return {
        query: searchMode ? query : undefined,
        pagination: {
            skip: pagination.offset,
            take: pagination.limit + 1
        },
        results: (elements: any[], count: number) => {
            return {
                data: elements.slice(0, pagination.limit),
                query: searchMode ? query : undefined,
                ...pagination,
                next: elements.length > pagination.limit ? pagination.offset + pagination.limit : null,
                prev: pagination.offset - pagination.limit < 0 ? null : pagination.offset - pagination.limit,
                total: count
            };
        }
    }
}

export type Pagination = ReturnType<typeof preparePagination>;

export { preparePagination };
