import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { CloudomiumSqsLambda } from '../src'
import { test } from 'node:test'
import { gzipSync } from 'zlib'

test('sqs lambda handler with invalid body', async () => {
    const handler = new CloudomiumSqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: 'invalid body' }] }, {})
    assert.equal(response.batchItemFailures.length, 1)
    assert.equal(response.batchItemFailures[0].itemIdentifier, 'abc')
})

test('sqs lambda handler with empty records', async () => {
    const handler = new CloudomiumSqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [] }, {})
    assert.equal(response.batchItemFailures.length, 0)
})

test('sqs lambda handler with records', async () => {
    const handler = new CloudomiumSqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware({ wait: true })).execute(async (event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, true)
        assert.equal(event.messageId, 'abc')
        assert.equal(event.body.abc, 123)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: gzipSync('{ "abc" : 123 }').toString('base64') }] }, {})
    assert.equal(response.batchItemFailures.length, 0)
})
