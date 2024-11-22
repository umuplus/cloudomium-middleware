export interface CallbackWaitsForEmptyEventLoopMiddlewareConfig {
    wait?: boolean
}

/**
 * Middleware to set the callbackWaitsForEmptyEventLoop property on the context object.
 * @param [config] Configuration object for the middleware.
 * @param [config.wait] A boolean to indicate if the event loop should wait for the callback to finish.
 * @returns A middleware function that sets the callbackWaitsForEmptyEventLoop property on the context object.
 */
export default function (config: CallbackWaitsForEmptyEventLoopMiddlewareConfig = {}) {
    return async (_event: any, context: any, _response: any): Promise<void> => {
        if (context) context.callbackWaitsForEmptyEventLoop = !!config.wait
    }
}
