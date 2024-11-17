import corsMiddleware from '../src/middlewares/cors'

import assert from 'node:assert/strict'
import { test } from 'node:test'

test('cors middleware origins', async () => {
    const middleware = corsMiddleware({
        origins: ['http://localhost:3000'],
    })
    const response: Record<string, any> = { statusCode: 200 }
    await middleware(null, null, response)
    assert.equal(response.headers['Access-Control-Allow-Origin'], 'http://localhost:3000')
    assert.equal(response.headers['Access-Control-Allow-Methods'], undefined)
    assert.equal(response.headers['Access-Control-Allow-Headers'], undefined)
    assert.equal(response.headers['Access-Control-Allow-Credentials'], undefined)
})

test('cors middleware full', async () => {
    const middleware = corsMiddleware({
        origins: ['http://localhost:3000', 'http://localhost:3001'],
        methods: ['GET', 'POST'],
        headers: ['Content-Type', 'Authorization'],
        credentials: true,
    })
    const response: Record<string, any> = { statusCode: 200 }
    await middleware(null, null, response)
    assert.equal(response.headers['Access-Control-Allow-Origin'], 'http://localhost:3000, http://localhost:3001')
    assert.equal(response.headers['Access-Control-Allow-Methods'], 'GET, POST')
    assert.equal(response.headers['Access-Control-Allow-Headers'], 'Content-Type, Authorization')
    assert.equal(response.headers['Access-Control-Allow-Credentials'], 'true')
})
