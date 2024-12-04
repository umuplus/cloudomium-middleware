import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { S3BatchEvent, S3BatchResponse } from '../types/s3'

/**
 * Lambda organizer with middleware support for SQS events
 * @class S3Lambda
 * @template CM - Message type
 * @template CC - Context type
 * @example new S3Lambda<MyMessage, Context>()
 */
export class S3Lambda<CM = unknown, CC = unknown> extends CloudomiumLambda<S3BatchEvent<CM>, CC, S3BatchResponse> {
    /**
     * Assigns the handler function
     * @param {Handler<CM, CC, S3BatchResponse>} handler - Handler to be executed for each record
     * @param {ErrorHandler<S3BatchResponse>} [onError] - Error handler for the handler
     * @returns {Handler<CM, CC, S3BatchResponse>}
     */
    execute(
        handler: Handler<CM, CC, S3BatchResponse>,
        onError?: ErrorHandler<S3BatchResponse>,
    ): Handler<S3BatchEvent<CM>, CC, S3BatchResponse> {
        return async (event: S3BatchEvent<CM>, context: CC): Promise<S3BatchResponse> => {
            let response: S3BatchResponse = undefined
            try {
                for (const { middleware, onError } of this.onBefore) {
                    try {
                        const result = await middleware(event, context)
                        if (result) return result
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }

                for (const record of event.Records) {
                    try {
                        response = await handler(record.s3, context)
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }

                for (const { middleware, onError } of this.onAfter) {
                    try {
                        const result = await middleware(event, context, response)
                        if (result) return result
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)

                return response
            }
            return response
        }
    }
}
