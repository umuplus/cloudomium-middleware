import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'

/**
 * Lambda organizer with middleware support for HTTP events
 * @class CloudomiumHttpLambda
 * @template CE - HTTP Event type
 * @template CC - Context type
 * @template CR - Response type
 * @example new CloudomiumHttpLambda<ApiGatewayProxyEventV2, Context, ApiGatewayProxyResultV2>()
 */
export class CloudomiumHttpLambda<CE = unknown, CC = unknown, CR = unknown> extends CloudomiumLambda<CE, CC, CR> {
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
