export interface CorsMiddlewareConfig {
    origins?: string[]
    headers?: string[]
    methods?: string[]
    credentials?: boolean
}

/**
 * Middleware to handle CORS (Cross-Origin Resource Sharing) requests.
 * @param [config] Configuration object for the middleware.
 * @param [config.origins] An array of allowed origins. Default is ['*'].
 * @param [config.headers] An array of allowed headers.
 * @param [config.methods] An array of allowed HTTP methods.
 * @param [config.credentials] A boolean to indicate if credentials are allowed.
 * @returns A middleware function that sets the appropriate CORS headers in the response.
 */
export default function (config: CorsMiddlewareConfig = {}) {
    const { origins, headers, methods, credentials } = config
    return async (_event: any, _context: any, response: any): Promise<void> => {
        if (!response.headers) response.headers = {}
        const allowedOrigins = origins?.join(', ') || '*'
        response.headers['Access-Control-Allow-Origin'] = allowedOrigins
        if (headers) response.headers['Access-Control-Allow-Headers'] = headers.join(', ')
        if (methods) response.headers['Access-Control-Allow-Methods'] = methods.join(', ')
        if (credentials) response.headers['Access-Control-Allow-Credentials'] = 'true'
    }
}
