import { ErrorHandler, Middleware } from "../types/middleware";

/**
 * Lambda organizer with middleware support
 * @class CloudomiumLambda
 * @template CE - Lambda Event
 * @template CC - Context type
 * @template CR - Response type
 */
export abstract class CloudomiumLambda<CE = unknown, CC = unknown, CR = unknown> {
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
}
