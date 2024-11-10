import jsonMiddleware from '../src/middlewares/json-body-parser'

import assert from 'node:assert/strict';
import { test } from 'node:test';

test('json body parser middleware simple', async () => {
    const middleware = await jsonMiddleware()
    const request: Record<string, any> = { body: JSON.stringify({ val: 'test' }) }
    await middleware(request, null)
    assert.equal(request.body.val, 'test')
})

test('json body parser middleware base64', async () => {
    const middleware = await jsonMiddleware({ base64: true })
    const request: Record<string, any> = { body: Buffer.from(JSON.stringify({ val: 'test' })).toString('base64') }
    await middleware(request, null)
    assert.equal(request.body.val, 'test')
})
