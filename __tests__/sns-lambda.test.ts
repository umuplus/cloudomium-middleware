import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { SnsLambda } from '../src'
import { test } from 'node:test'

test('sns lambda handler with empty records', async () => {
    const handler = new SnsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    const response = await handler({ Records: [] }, {})
    assert.equal(response, undefined)
})

test('sns lambda handler with records', async () => {
    const handler = new SnsLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (event: any, context: any) => {
        assert.equal(event.sns.a, '1')
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    const response = await handler({ Records: [ { sns: { a: '1', b: '2' } } ] }, {})
    assert.equal(response, undefined)
})
