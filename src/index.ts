export type Handler<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC) => Promise<CR>
export type ErrorHandler<CR = unknown> = (err: Error) => Promise<CR>
export type Middleware<CE = unknown, CC = unknown, CR = unknown> = (event: CE, context: CC, response?: CR) => Promise<CR | void>

export class CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown> {
    protected onBefore: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []
    protected onAfter: Array<{ middleware: Middleware<CE, CC, CR>; onError?: ErrorHandler<CR> }> = []

    before(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onBefore.push({ middleware, onError })
        return this
    }

    after(middleware: Middleware<CE, CC, CR>, onError?: ErrorHandler<CR>): this {
        this.onAfter.push({ middleware, onError })
        return this
    }

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
