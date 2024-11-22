import callbackWaitsForEmptyEventLoopMiddleware from '../src/middlewares/callback-waits-for-empty-event-loop'

import assert from 'node:assert/strict'
import { test } from 'node:test'

test('callback waits for empty event loop', async () => {
    const middleware = callbackWaitsForEmptyEventLoopMiddleware({
        wait: true,
    })
    const context: Record<string, any> = {}
    await middleware(null, context, null)
    assert.equal(context.callbackWaitsForEmptyEventLoop, true)
})

test('callback does not wait for empty event loop', async () => {
    const middleware = callbackWaitsForEmptyEventLoopMiddleware()
    const context: Record<string, any> = {}
    await middleware(null, context, null)
    assert.equal(context.callbackWaitsForEmptyEventLoop, false)
})
