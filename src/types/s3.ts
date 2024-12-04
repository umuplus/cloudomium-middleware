export type S3BatchResponse = string | undefined | void

export interface S3BatchEnvelope<T> {
    s3: T
}

export interface S3BatchEvent<T> {
    Records: Array<S3BatchEnvelope<T>>
}
