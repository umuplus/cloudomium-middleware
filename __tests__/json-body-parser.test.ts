import jsonMiddleware from '../src/middlewares/json-body-parser'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { gzipSync } from 'node:zlib'

test('json body parser middleware simple', async () => {
    const middleware = jsonMiddleware()
    const request: Record<string, any> = { body: JSON.stringify({ val: 'test' }) }
    await middleware(request, null)
    assert.equal(request.body.val, 'test')
})

test('json body parser middleware base64 only', async () => {
    const middleware = jsonMiddleware({ base64: true })
    const request: Record<string, any> = { body: Buffer.from(JSON.stringify({ val: 'test' })).toString('base64') }
    await middleware(request, null)
    assert.equal(request.body.val, 'test')
})

test('json body parser middleware with compressed', async () => {
    const payload = JSON.stringify({ val: 'test' })
    const compressedPayload = gzipSync(payload).toString('base64')
    const middleware = jsonMiddleware({ compressed: true, base64: true })
    const request: Record<string, any> = { body: compressedPayload }
    await middleware(request, null)
    assert.equal(request.body.val, 'test')
})

test('json body parser middleware base64 error', async () => {
    const middleware = jsonMiddleware({ base64: true })
    const request: Record<string, any> = { body: Buffer.from('xyz').toString('base64') }
    try {
        await middleware(request, null)
        assert.fail('Should throw error')
    } catch (e) {
        assert.equal((e as Error).message, `Unexpected token 'x', "xyz" is not valid JSON`)
    }
})
