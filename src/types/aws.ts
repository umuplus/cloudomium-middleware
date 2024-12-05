enum DynamodbResourceType {
    'TABLE' = 'DYNAMOdb_TABLE',
    'STREAM' = 'DYNAMOdb_STREAM',
    'EVENT_SOURCE_MAPPING' = 'DYNAMOdb_EVENT_SOURCE_MAPPING',
}

enum KinesisResourceType {
    'STREAM' = 'KINESIS_STREAM',
    'EVENT_SOURCE_MAPPING' = 'KINESIS_EVENT_SOURCE_MAPPING',
}

enum LambdaResourceType {
    'FUNCTION' = 'LAMBDA_FUNCTION',
}

enum S3ResourceType {
    'BUCKET' = 'S3_BUCKET',
    'EVENT_SOURCE_MAPPING' = 'S3_EVENT_SOURCE_MAPPING',
}

enum SqsResourceType {
    'QUEUE' = 'SQS_QUEUE',
    'EVENT_SOURCE_MAPPING' = 'SQS_EVENT_SOURCE_MAPPING',
}

export const ResourceType = {
    Dynamodb: DynamodbResourceType,
    Kinesis: KinesisResourceType,
    Lambda: LambdaResourceType,
    S3: S3ResourceType,
    Sqs: SqsResourceType,
}

export type ResourceType = typeof ResourceType
