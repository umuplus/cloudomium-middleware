export interface DynamodbStreamEvent<T> {
    Records: Array<T>
}
