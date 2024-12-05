export type S3BatchResponse = string | undefined | void

export interface S3BatchEvent<T> {
    Records: Array<T>
}
