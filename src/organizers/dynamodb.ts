import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { DynamodbStreamEvent } from '../types/dynamodb'

/**
 * Lambda organizer with middleware support for Dynamodb stream events
 * @class DynamodbLambda
 * @template CM - Message type
 * @template CC - Context type
 * @example new DynamodbLambda<MyMessage, Context>()
 */
export class DynamodbLambda<CM = unknown, CC = unknown> extends CloudomiumLambda<DynamodbStreamEvent<CM>, CC, void> {
    /**
     * Assigns the handler function
     * @param {Handler<CM, CC, void>} handler - Handler to be executed for each record
     * @param {ErrorHandler<void>} [onError] - Error handler for the handler
     * @returns {Handler<CM, CC, void>}
     */
    execute(
        handler: Handler<CM, CC, void>,
        onError?: ErrorHandler<void>,
    ): Handler<DynamodbStreamEvent<CM>, CC, void> {
        return async (event: DynamodbStreamEvent<CM>, context: CC): Promise<void> => {
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
