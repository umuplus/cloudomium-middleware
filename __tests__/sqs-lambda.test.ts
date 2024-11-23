import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { CloudomiumSqsLambda } from '../src'
import { test } from 'node:test'

test('lambda handler with invalid body', async () => {
    const handler = new CloudomiumSqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [{ messageId: 'abc', body: 'invalid body' }] }, {})
    assert.equal(response.batchItemFailures.length, 1)
    assert.equal(response.batchItemFailures[0].itemIdentifier, 'abc')
})

test('lambda handler with empty records', async () => {
    const handler = new CloudomiumSqsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
        return { batchItemFailures: [] }
    })
    const response: any = await handler({ Records: [] }, {})
    assert.equal(response.batchItemFailures.length, 0)
})
