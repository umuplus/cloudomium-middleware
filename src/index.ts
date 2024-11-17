export type Handler<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC) => Promise<CR>
export type ErrorHandler<CR = unknown> = (err: Error) => Promise<CR>
export type Middleware<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC, response?: CR) => Promise<CR | void>

/**
 * Lambda organizer with middleware support
 * @class CloudomiumLambda
 * @template CE - Cloud Event type
 * @template CC - Context type
 * @template CR - Response type
 * @example new CloudomiumLambda<ApiGatewayProxyEventV2, Context, ApiGatewayProxyResultV2>()
 */
export class CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown> {
    protected onBefore: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []
    protected onAfter: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []

    /**
     * Adds a middleware to be executed before the handler
     * @param {Middleware<CE, CC, CR>} middleware - Middleware to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the middleware
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
    */
    before(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onBefore.push({ middleware, onError })
        return this
    }

    /**
     * Adds a middleware to be executed after the handler
     * @param {Middleware<CE, CC, CR>} middleware - Middleware to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the middleware
     * @returns {CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown>}
    */
    after(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onAfter.push({ middleware, onError })
        return this
    }

    /**
     * Assigns the handler function
     * @param {Handler<CE, CC, CR>} handler - Handler to be executed
     * @param {ErrorHandler<CR>} [onError] - Error handler for the handler
     * @returns {Handler<CE, CC, CR>}
    */
    execute(handler: Handler<CE, CC, CR>, onError?: ErrorHandler<CR>): Handler<CE, CC, CR> {
        return async (event: CE, context: CC): Promise<CR> => {
            for (const { middleware, onError } of this.onBefore) {
                try {
                    const result = await middleware(event, context)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'Something went wrong',
                            reason: err.message,
                            middleware: middleware.name,
                        }),
                    } as CR
                }
            }

            let response: CR = { statusCode: 204 } as CR
            try {
                const result = await handler(event, context)
                if (result) response = result
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

                return {
                    statusCode: 500,
                    body: JSON.stringify({
                        message: 'Something went wrong',
                        reason: err.message,
                        handler: true,
                    }),
                } as CR
            }

            for (const { middleware, onError } of this.onAfter) {
                try {
                    const result = await middleware(event, context, response)
                    if (result) return result
                } catch (e) {
                    const err = e as Error
                    if (onError) return onError(err)

                    return {
                        statusCode: 500,
                        body: JSON.stringify({
                            message: 'Something went wrong',
                            reason: err.message,
                            middleware: middleware.name,
                        }),
                    } as CR
                }
            }

            return response
        }
    }
}

export * from './middlewares'
