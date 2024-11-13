import { JwtVerifyOptions } from '../types/jwt'

export interface AuthMiddlewareConfig {
    jwt: any
    jwtOptions?: JwtVerifyOptions

    header?: string
    secret: string

    mustSignedIn?: boolean
    check?: (claims?: any) => Promise<void>
}

function verifyToken(token: string, secret: string, config: AuthMiddlewareConfig) {
    const { jwt, jwtOptions, mustSignedIn } = config
    try {
        return jwt.verify(token, secret, jwtOptions)
    } catch (e) {
        if (mustSignedIn) throw e
    }
}

/**
 * Middleware for authentication
 *
 * @param [config] - Configuration for the middleware
 * @param config.jwt - JWT library
 * @param [config.jwtOptions] - Options for jwt.verify
 * @param [config.header] - Header key for the token
 * @param config.secret - Secret for the token
 * @param [config.mustSignedIn] - Whether the token is required
 * @param [config.check] - Function to check the claims
 * @returns A middleware function that authenticates the token
 */
export default async function (config: AuthMiddlewareConfig) {
    const { check, header, mustSignedIn, secret } = config
    return async (event: any, context: any): Promise<void> => {
        let accessToken = event.headers?.[header || 'authorization']
        if (!accessToken && mustSignedIn) throw new Error('missing access token')

        if (accessToken) {
            if (accessToken.startsWith('Bearer ')) accessToken = accessToken.slice(7)
            const claims = verifyToken(accessToken, secret, config)
            if (claims) context.claims = claims
            if (check) check(claims)
        }
    }
}
