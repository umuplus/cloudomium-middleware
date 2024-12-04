import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { S3Lambda } from '../src'
import { test } from 'node:test'

test('s3 lambda handler with empty records', async () => {
    const handler = new S3Lambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    const response = await handler({ Records: [] }, {})
    assert.equal(response, undefined)
})

test('s3 lambda handler with records', async () => {
    const handler = new S3Lambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (event: any, context: any) => {
        assert.equal(event.a, '1')
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return event.b
    })
    const response = await handler({ Records: [ { s3: { a: '1', b: '2' } } ] }, {})
    assert.equal(response, '2')
})
