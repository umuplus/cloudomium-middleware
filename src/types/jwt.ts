export type Algorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256' | 'RS384' | 'RS512' | 'ES256' | 'ES384' | 'ES512' | 'PS256' | 'PS384' | 'PS512' | 'none'

export interface JwtVerifyOptions {
    algorithms?: Algorithm[]
    audience?: string | RegExp | Array<string | RegExp>
    clockTimestamp?: number
    clockTolerance?: number
    complete?: boolean
    issuer?: string | string[]
    ignoreExpiration?: boolean
    ignoreNotBefore?: boolean
    jwtid?: string
    nonce?: string
    subject?: string
    maxAge?: string | number
}
