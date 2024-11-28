export interface KinesisBatchRecordData<T> {
    [key: string]: any
    partitionKey: string
    data: T
}

export interface KinesisBatchRecord<T> {
    [key: string]: any
    kinesis: KinesisBatchRecordData<T>
}

export interface KinesisBatchEvent<T> {
    Records: Array<KinesisBatchRecord<T>>
}
