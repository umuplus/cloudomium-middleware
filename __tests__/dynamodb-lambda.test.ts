import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { DynamodbLambda } from '../src'
import { test } from 'node:test'

test('dynamodb lambda handler with empty records', async () => {
    const handler = new DynamodbLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    const response = await handler({ Records: [] }, {})
    assert.equal(response, undefined)
})

test('dynamodb lambda handler with records', async () => {
    const handler = new DynamodbLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (event: any, context: any) => {
        assert.equal(event.dynamodb.a, '1')
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    const response = await handler({ Records: [ { dynamodb: { a: '1', b: '2' } } ] }, {})
    assert.equal(response, undefined)
})
