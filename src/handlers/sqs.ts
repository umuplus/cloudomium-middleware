import { CloudomiumLambda } from './_lambda'
import { ErrorHandler, Handler } from '../types/middleware'
import { gunzipSync } from 'zlib'
import { SqsBatchEvent, SqsBatchRecord, SqsBatchResponse } from '../types/sqs'

/**
 * Lambda organizer with middleware support for SQS events
 * @class SqsLambda
 * @template CM - Message type
 * @template CC - Context type
 * @example new SqsLambda<MyMessage, Context>()
 */
export class SqsLambda<CM = unknown, CC = unknown> extends CloudomiumLambda<SqsBatchEvent<CM>, CC, SqsBatchResponse> {
    /**
     * Assigns the handler function
     * @param {Handler<CM, CC, SqsBatchResponse>} handler - Handler to be executed for each record
     * @param {ErrorHandler<SqsBatchResponse>} [onError] - Error handler for the handler
     * @returns {Handler<CM, CC, SqsBatchResponse>}
     */
    execute(
        handler: Handler<SqsBatchRecord<CM>, CC, SqsBatchResponse>,
        onError?: ErrorHandler<SqsBatchResponse>,
    ): Handler<SqsBatchEvent<CM>, CC, SqsBatchResponse> {
        return async (event: SqsBatchEvent<CM>, context: CC): Promise<SqsBatchResponse> => {
            let response: SqsBatchResponse = { batchItemFailures: [] } as SqsBatchResponse
            try {
                for (const { middleware, onError } of this.onBefore) {
                    try {
                        const result = await middleware(event, context)
                        if (result) return result
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        response.batchItemFailures = event.Records.map((record) => ({ itemIdentifier: record.messageId }))
                        return response
                    }
                }

                for (const record of event.Records) {
                    try {
                        const body = JSON.parse(gunzipSync(Buffer.from(record.body as string, 'base64')).toString('utf-8')) as CM
                        const result = await handler({ ...record, body }, context)
                        if (result.batchItemFailures?.length) response.batchItemFailures = result.batchItemFailures
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        response.batchItemFailures.push({ itemIdentifier: record.messageId })
                    }
                }

                for (const { middleware, onError } of this.onAfter) {
                    try {
                        const result = await middleware(event, context, response)
                        if (result) return result
                    } catch (e) {
                        const err = e as Error
                        if (onError) return onError(err)

                        response.batchItemFailures = event.Records.map((record) => ({ itemIdentifier: record.messageId }))
                        return response
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
