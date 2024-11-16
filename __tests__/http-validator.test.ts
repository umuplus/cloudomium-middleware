import httpValidatorMiddleware from '../src/middlewares/http-validator'

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { z, ZodError } from 'zod'

test('http validator middleware body fails', async () => {
    const TestModel = z.object({ name: z.string().min(3) })
    const middleware = await httpValidatorMiddleware({
        body: TestModel,
        onError: async (error, type) => {
            assert.equal(type, 'body')
            assert.equal((error as ZodError).issues[0].message, 'String must contain at least 3 character(s)')
        },
    })
    const request: Record<string, any> = { body: { name: 'a' } }
    await middleware(request, null)
})

test('http validator middleware body success', async () => {
    const TestModel = z.object({ name: z.string().min(3), additionalNumber: z.number().nonnegative().default(2) })
    const middleware = await httpValidatorMiddleware({
        body: TestModel,
        onError: async (_error, _type) => {
            new Error('Should not be called')
        },
    })
    const request: Record<string, any> = { body: { name: 'test' } }
    await middleware(request, null)
    assert.equal(request.body.additionalNumber, 2)
})

test('http validator middleware query string fails', async () => {
    const TestModel = z.object({ name: z.string().min(3) })
    const middleware = await httpValidatorMiddleware({
        queryString: TestModel,
        onError: async (error, type) => {
            assert.equal(type, 'queryString')
            assert.equal((error as ZodError).issues[0].message, 'String must contain at least 3 character(s)')
        },
    })
    const request: Record<string, any> = { queryStringParameters: { name: 'a' } }
    await middleware(request, null)
})

test('http validator middleware query string success', async () => {
    const TestModel = z.object({ name: z.string().min(3), additionalNumber: z.string().default('2') })
    const middleware = await httpValidatorMiddleware({
        queryString: TestModel,
        onError: async (_error, _type) => {
            new Error('Should not be called')
        },
    })
    const request: Record<string, any> = { queryStringParameters: { name: 'test' } }
    await middleware(request, null)
    assert.equal(request.queryStringParameters.additionalNumber, '2')
})

test('http validator middleware path parameters fails', async () => {
    const TestModel = z.object({ name: z.string().min(3) })
    const middleware = await httpValidatorMiddleware({
        pathParameters: TestModel,
        onError: async (error, type) => {
            assert.equal(type, 'pathParameters')
            assert.equal((error as ZodError).issues[0].message, 'String must contain at least 3 character(s)')
        },
    })
    const request: Record<string, any> = { pathParameters: { name: 'a' } }
    await middleware(request, null)
})

test('http validator middleware path parameters success', async () => {
    const TestModel = z.object({ name: z.string().min(3), additionalNumber: z.string().default('2') })
    const middleware = await httpValidatorMiddleware({
        pathParameters: TestModel,
        onError: async (_error, _type) => {
            new Error('Should not be called')
        },
    })
    const request: Record<string, any> = { pathParameters: { name: 'test' } }
    await middleware(request, null)
    assert.equal(request.pathParameters.additionalNumber, '2')
})

test('http validator middleware headers fails', async () => {
    const TestModel = z.object({ name: z.string().min(3) })
    const middleware = await httpValidatorMiddleware({
        headers: TestModel,
        onError: async (error, type) => {
            assert.equal(type, 'headers')
            assert.equal((error as ZodError).issues[0].message, 'String must contain at least 3 character(s)')
        },
    })
    const request: Record<string, any> = { headers: { name: 'a' } }
    await middleware(request, null)
})

test('http validator middleware headers success', async () => {
    const TestModel = z.object({ name: z.string().min(3), additionalNumber: z.string().default('2') })
    const middleware = await httpValidatorMiddleware({
        headers: TestModel,
        onError: async (_error, _type) => {
            new Error('Should not be called')
        },
    })
    const request: Record<string, any> = { headers: { name: 'test' } }
    await middleware(request, null)
    assert.equal(request.headers.additionalNumber, '2')
})
