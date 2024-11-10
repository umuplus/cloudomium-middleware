export interface JsonMiddlewareConfig {
    base64?: boolean
}

/**
 * Middleware to parse the request body as JSON.
 * @param [config] Configuration object for the middleware.
 * @param [config.base64] A boolean to indicate if the body is base64 encoded.
 * @returns A middleware function that parses the request body as JSON.
 */
export default async function (config: JsonMiddlewareConfig = {}) {
    return async (event: any, _context: any): Promise<void> => {
        const body = config.base64 ? Buffer.from(event.body, 'base64').toString('utf-8') : event.body || '{}'
        event.body = JSON.parse(body)
    }
}
