export interface SqsBatchItemIdentifier {
    itemIdentifier: string
}

export interface SqsBatchResponse {
    batchItemFailures: SqsBatchItemIdentifier[]
}

export interface SqsBatchRecord<T> {
    [key: string]: any
    body: T
}

export interface SqsBatchEvent<T> {
    Records: Array<SqsBatchRecord<T>>
}
