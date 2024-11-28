import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { KinesisBatchEvent, KinesisBatchRecord } from '../types/kinesis'

/**
 * Lambda organizer with middleware support for Kinesis events
 * @class CloudomiumKinesisLambda
 * @template CM - Message type
 * @template CC - Context type
 * @example new CloudomiumKinesisLambda<MyMessage, KinesisEvent, Context>()
 */
export class CloudomiumKinesisLambda<CM = unknown, CC = unknown> extends CloudomiumLambda<KinesisBatchEvent<CM>, CC, void> {
    /**
     * Assigns the handler function
     * @param {Handler<CM, CC, void>} handler - Handler to be executed for each record
     * @param {ErrorHandler<void>} [onError] - Error handler for the handler
     * @returns {Handler<CM, CC, void>}
     */
    execute(handler: Handler<KinesisBatchRecord<CM>, CC, void>, onError?: ErrorHandler<void>): Handler<KinesisBatchEvent<CM>, CC, void> {
        return async (event: KinesisBatchEvent<CM>, context: CC): Promise<void> => {
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
                        const { data } = record.kinesis
                        const body = JSON.parse(Buffer.from(data as string, 'base64').toString('utf-8')) as CM
                        await handler({ ...record, kinesis: { ...record.kinesis, data: body } }, context)
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

                throw err
            }
        }
    }
}
