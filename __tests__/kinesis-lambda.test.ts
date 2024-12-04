import assert from 'node:assert/strict'
import { callbackWaitsForEmptyEventLoopMiddleware } from '../src'
import { KinesisLambda } from '../src'
import { test } from 'node:test'

test('kinesis lambda handler with invalid body', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    try {
        await handler({ Records: [{ kinesis: { partitionKey: 'part', data: 'invalid body' } }] }, {})
        assert.fail('Should have thrown an error')
    } catch (e) {
        assert.equal((e as Error).message.endsWith('is not valid JSON'), true)
    }
})

test('kinesis lambda handler with empty records', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware()).execute(async (_event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, false)
    })
    await handler({ Records: [] }, {})
})

test('kinesis lambda handler with records', async () => {
    const handler = new KinesisLambda().before(callbackWaitsForEmptyEventLoopMiddleware({ wait: true })).execute(async (event: any, context: any) => {
        assert.equal(context.callbackWaitsForEmptyEventLoop, true)
        assert.equal(event.kinesis.partitionKey, 'part')
        assert.equal(event.kinesis.data.abc, 123)
    })
    await handler({ Records: [{ kinesis: { partitionKey: 'part', data: Buffer.from('{ "abc" : 123 }').toString('base64') } }] }, {})
})
