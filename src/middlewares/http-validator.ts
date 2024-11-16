export interface CloudomiumValidatorMiddlewareConfig {
    body?: any
    queryString?: any
    pathParameters?: any
    headers?: any

    onError?: (e: Error, key: string) => Promise<any>
}

/**
 * Middleware for validating api gateway event
 *
 * @param [config] - Configuration for the middleware
 * @param [config.body] - Zod schema for body
 * @param [config.queryString] - Zod schema for queryString
 * @param [config.pathParameters] - Zod schema for pathParameters
 * @param [config.headers] - Zod schema for headers
 * @returns A middleware function that validates api gateway event
 */
export default async function (config: CloudomiumValidatorMiddlewareConfig = {}) {
    const { body, queryString, pathParameters, headers, onError } = config
    return async (event: any, _context: any): Promise<void> => {
        if (body) {
            const validated = body.safeParse(event.body || {})
            if (!validated.success) {
                if (onError) return onError(validated.error, 'body')

                throw validated.error
            }

            event.body = validated.data
        }

        if (queryString) {
            const validated = queryString.safeParse(event.queryStringParameters || {})
            if (!validated.success) {
                if (onError) return onError(validated.error, 'queryString')

                throw validated.error
            }

            event.queryStringParameters = validated.data
        }

        if (pathParameters) {
            const validated = pathParameters.safeParse(event.pathParameters || {})
            if (!validated.success) {
                if (onError) return onError(validated.error, 'pathParameters')

                throw validated.error
            }

            event.pathParameters = validated.data
        }

        if (headers) {
            const validated = headers.safeParse(event.headers || {})
            if (!validated.success) {
                if (onError) return onError(validated.error, 'headers')

                throw validated.error
            }

            event.headers = validated.data
        }
    }
}
