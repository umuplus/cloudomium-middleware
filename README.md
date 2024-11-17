# Cloudomium Middleware

This project is a set of tools for easier serverless development on AWS Lambda.

## Middleware Engine for AWS Lambda

The middleware engine **CloudomiumLambda** provides methods for adding set of functions in front of the handler, as well as the afterwards.

### Before / After The Lambda Handler

There are methods called **before** and **after** in CloudomiumLambda.
These method adds middleware functions to be called right before or right after executing the handler function.
Usually, the middlewares which added to be called *before* the handler are for processing the request.
On the other hand, the middlewares which added to be called *after* the handler are for processing the response.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| middleware | function | true | a middleware function that implements **Middleware** interface |
| onError | function | false | a function that implements **ErrorHandler** interface |

To define the handler function, there is a method called **execute**

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| handler | function | true | a handler function that implements **Handler** interface |
| onError | function | false | a function that implements **ErrorHandler** interface |

```typescript
const handler = new CloudomiumLambda()
    .before(await middlewareA())
    .after(await middlewareB())
    .execute(async (event, context) => {
        return { statusCode: 204 }
    })
```

## Built-in Middlewares

There are various built-in middlewares.
Also, you can easily build your own middlewares by creating a function that implements **Middleware** interface.

### Authentication

This middleware adds an authentication and authorization layer in front of the Lambda handler function.
While the jwt token is for authentication part, **check** function is for authorization.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| jwt | object | true | [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) instance |
| jwtOptions | object | false | official [options](https://www.npmjs.com/package/jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback) for jsonwebtoken instance |
| secret | secret | true | the secret value for signing and verifying tokens |
| header | string | false | header key for tokens, default value is **authorization** |
| mustSignIn | boolean | false | flag to determine authentication requirement |
| check | function | false | function for validating claims inside the token |

```typescript
import jwt from 'jsonwebtoken'
import { CloudomiumLambda } from '@cloudomium/middleware'

const handler = new CloudomiumLambda()
    .before(await authMiddleware({ jwt, secret: 'my secret', mustSignedIn: true }), (error, type) => console.error(type, error))
    .execute(async (event, context) => {
        return { statusCode: 204 }
    })
```

### CORS

This middleware adds a simple CORS support to the response.
*It's better (also cheaper) to solve CORS in front of Lambda, instead of invoking one*

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| origins | string[] | false | allowed origins. default value is "*" |
| headers | string[] | false | allowed headers |
| methods | string[] | false | allowed methods |
| credentials | boolean | false | flag to allow credentials |

```typescript
import { CloudomiumLambda } from '@cloudomium/middleware'

const handler = new CloudomiumLambda()
    .before(await corsMiddleware({ origins: ['http://localhost:9000'] }), (error, type) => console.error(type, error))
    .execute(async (event, context) => {
        return { statusCode: 204 }
    })
```

### JSON Body Parser

This middleware adds a support for JSON payload.

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| base64 | boolean | false | flag for base64 encoding |
| compressed | boolean | false | flag for gzip compression |

```typescript
import { CloudomiumLambda } from '@cloudomium/middleware'

const handler = new CloudomiumLambda()
    .before(await jsonMiddleware(), (error, type) => console.error(type, error))
    .execute(async (event, context) => {
        return { statusCode: 204 }
    })
```

### HTTP Validator

This middleware adds a validation support for input and / or output data

| Parameter | Type | Required | Description |
| --------- | ---- | -------- | ----------- |
| body | object | false | ZodError model for body |
| queryString | object | false | ZodError model for queryString |
| pathParameters | object | false | ZodError model for pathParameters |
| headers | object | false | ZodError model for headers |
| onError | function | false | Error handling function |

```typescript
import { CloudomiumLambda } from '@cloudomium/middleware'

const handler = new CloudomiumLambda()
    .before(await validate({ body: z.object({ name: z.string() }) }), (error, type) => console.error(type, error))
    .execute(async (event, context) => {
        return { statusCode: 204 }
    })
```
