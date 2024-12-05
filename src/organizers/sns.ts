import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { SnsBatchEvent } from '../types/sns'

/**
 * Lambda organizer with middleware support for Sns stream events
 * @class SnsLambda
 * @template CM - Message type
 * @template CC - Context type
 * @example new SnsLambda<SnsEventRecord, Context>()
 */
export class SnsLambda<CM = unknown, CC = unknown> extends CloudomiumLambda<SnsBatchEvent<CM>, CC, void> {
    /**
     * Assigns the handler function
     * @param {Handler<CM, CC, void>} handler - Handler to be executed for each record
     * @param {ErrorHandler<void>} [onError] - Error handler for the handler
     * @returns {Handler<CM, CC, void>}
     */
    execute(
        handler: Handler<CM, CC, void>,
        onError?: ErrorHandler<void>,
    ): Handler<SnsBatchEvent<CM>, CC, void> {
        return async (event: SnsBatchEvent<CM>, context: CC): Promise<void> => {
            try {
                for (const { middleware, onError } of this.onBefore) {
                    try {
                        await middleware(event, context)
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }

                for (const record of event.Records) {
                    try {
                        await handler(record, context)
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }

                for (const { middleware, onError } of this.onAfter) {
                    try {
                        await middleware(event, context)
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        throw err
                    }
                }
            } catch (e) {
                const err = e as Error
                if (onError) return onError(err)
            }
        }
    }
}
