import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'
import { authMiddleware, corsMiddleware, httpValidatorMiddleware, jsonBodyParserMiddleware } from '../src'
import { HttpLambda } from '../src'
import { test } from 'node:test'
import { z } from 'zod'

test('lambda handler without middlewares', async () => {
    const body = JSON.stringify({ val: 'test' })
    const request: Record<string, any> = { body }
    const handler = new HttpLambda().execute(async (event: any) => {
        assert.equal(event.body, body)
        return { statusCode: 204 }
    })
    const response: any = await handler(request, {})
    assert.equal(response.statusCode, 204)
})

test('lambda handler with json body middleware', async () => {
    const body = JSON.stringify({ val: 'test' })
    const request: Record<string, any> = { body }
    const handler = new HttpLambda().before(jsonBodyParserMiddleware()).execute(async (event: any) => {
        assert.equal(event.body.val, 'test')
        return { statusCode: 204 }
    })
    const response: any = await handler(request, {})
    assert.equal(response.statusCode, 204)
})

test('lambda handler with http validator middleware', async () => {
    const TestModel = z.object({ name: z.string().min(3), additionalNumber: z.number().nonnegative().default(2) })
    const body = JSON.stringify({ name: 'test' })
    const request: Record<string, any> = { body }
    const handler = new HttpLambda()
        .before(jsonBodyParserMiddleware())
        .before(httpValidatorMiddleware({ body: TestModel }))
        .execute(async (event: any) => {
            assert.equal(event.body.name, 'test')
            assert.equal(event.body.additionalNumber, 2)
            return { statusCode: 204 }
        })
    const response: any = await handler(request, {})
    assert.equal(response.statusCode, 204)
})

test('lambda handler with cors middleware', async () => {
    const body = JSON.stringify({ val: 'test' })
    const request: Record<string, any> = { body }
    const handler = new HttpLambda()
        .before(jsonBodyParserMiddleware())
        .after(corsMiddleware())
        .execute(async (event: any) => {
            assert.equal(event.body.val, 'test')
            return { statusCode: 204 }
        })
    const response: any = await handler(request, {})
    assert.equal(response.statusCode, 204)
    assert.equal(response.headers['Access-Control-Allow-Origin'], '*')
})

test('lambda handler with auth middleware', async () => {
    const claims = { test: Math.random().toString().split('.').pop() }
    const secret = 'secret'
    const token = jwt.sign(claims, secret)

    const body = JSON.stringify({ val: 'test' })
    const request: Record<string, any> = { body, headers: { authorization: `Bearer ${token}` } }
    const handler = new HttpLambda()
        .before(authMiddleware({ jwt, secret, mustSignedIn: true }))
        .before(jsonBodyParserMiddleware())
        .execute(async (event: any) => {
            assert.equal(event.body.val, 'test')
            return { statusCode: 204 }
        })
    const context: Record<string, any> = {}
    const response: any = await handler(request, context)
    assert.equal(response.statusCode, 204)
    assert.equal(context.claims.test, claims.test)
})
