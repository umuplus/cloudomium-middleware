import { unzipSync } from 'zlib'

export interface JsonBodyParserMiddlewareConfig {
    base64?: boolean
    compressed?: boolean
}

/**
 * Middleware to parse the request body as JSON.
 * @param [config] Configuration object for the middleware.
 * @param [config.base64] A boolean to indicate if the body is base64 encoded.
 * @returns A middleware function that parses the request body as JSON.
 */
export default function (config: JsonBodyParserMiddlewareConfig = {}) {
    return async (event: any, _context: any): Promise<void> => {
        let body = config.base64 ? Buffer.from(event.body, 'base64') : event.body || '{}'
        if (config.compressed) body = unzipSync(body)
        event.body = JSON.parse(body.toString())
    }
}
