import authMiddleware from '../src/middlewares/auth'
import jwt from 'jsonwebtoken'

import assert from 'node:assert/strict'
import { test } from 'node:test'

test('missing access token', async () => {
    const middleware = await authMiddleware({ jwt, secret: 'secret', mustSignedIn: true })
    const request: Record<string, any> = { headers: {} }
    const context: Record<string, any> = {}
    try {
        await middleware(request, context)
        throw new Error('should have been thrown')
    } catch (e) {
        assert.equal((e as Error).message, 'missing access token')
    }
})

test('invalid access token', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'different-secret'
    const token = jwt.sign(claims, secret)
    const middleware = await authMiddleware({ jwt, secret: 'secret', mustSignedIn: true })
    const request: Record<string, any> = { headers: { authorization: `Bearer ${token}` } }
    const context: Record<string, any> = {}
    try {
        await middleware(request, context)
        throw new Error('should have been thrown')
    } catch (e) {
        assert.equal((e as Error).message, 'invalid signature')
    }
})

test('expired access token', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'secret'
    const token = jwt.sign(claims, secret, { expiresIn: '1ms' })
    await new Promise((resolve) => setTimeout(resolve, 5))
    const middleware = await authMiddleware({ jwt, secret, mustSignedIn: true })
    const request: Record<string, any> = { headers: { authorization: `Bearer ${token}` } }
    const context: Record<string, any> = {}
    try {
        await middleware(request, context)
        throw new Error('should have been thrown')
    } catch (e) {
        assert.equal((e as Error).message, 'jwt expired')
    }
})

test('access token belongs to future', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'secret'
    const token = jwt.sign(claims, secret, { notBefore: '1h' })
    const middleware = await authMiddleware({ jwt, secret, mustSignedIn: true })
    const request: Record<string, any> = { headers: { authorization: `Bearer ${token}` } }
    const context: Record<string, any> = {}
    try {
        await middleware(request, context)
        throw new Error('should have been thrown')
    } catch (e) {
        assert.equal((e as Error).message, 'jwt not active')
    }
})

test('simple access token authentication', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'secret'
    const token = jwt.sign(claims, secret)
    const middleware = await authMiddleware({ jwt, secret })
    const request: Record<string, any> = { headers: { authorization: `Bearer ${token}` } }
    const context: Record<string, any> = {}
    await middleware(request, context)
    assert.equal(context.claims.test, claims.test)
})

test('custom access token authentication', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'secret'
    const token = jwt.sign(claims, secret)
    const middleware = await authMiddleware({ jwt, secret, header: 'x-api-token' })
    const request: Record<string, any> = { headers: { 'x-api-token': token } }
    const context: Record<string, any> = {}
    await middleware(request, context)
    assert.equal(context.claims.test, claims.test)
})
