import { Unauthorized } from '../responses/clientErrors/unauthorized.clientError.js'
import jwt from 'jsonwebtoken'
import { ErrorDescription, VerifyTokenStatus, ErrorCode } from '../common/constants.js'
import { platforms, verifyTokenSignature } from '../utils/jsonwebtoken.util.js'
import { getPlatformPublicKey } from '../utils/storage.util.js'
import { type NextFunction, type Request, type Response } from 'express'
export default class ApiMiddleware {
  apiRouteNotFound (req: Request, res: Response, next: NextFunction): Response {
    return res.status(400).json({ message: 'not found' })
  }

  jsonWebToken = (req: Request, res: Response, next: NextFunction): void => {
    const { headers } = req
    if (headers.authorization === null || headers.authorization === undefined || headers.authorization === '') {
      throw new Unauthorized(ErrorCode.UNAUTHORIZED, ErrorDescription.UNAUTHORIZED, 'access token is required')
    }
    const accessToken = headers.authorization.replace('Bearer', '').trim()
    const decodedToken = jwt.decode(accessToken)
    if (decodedToken === null) {
      throw new Unauthorized(ErrorCode.INVALID_TOKEN_FORMAT, ErrorDescription.UNAUTHORIZED, 'invalid token')
    }
    const { aud: tokenAudience, sub: tokenSubscriber } = decodedToken as jwt.JwtPayload
    const assignedPlatform = platforms(tokenAudience as string)
    if (assignedPlatform === undefined) {
      throw new Unauthorized(ErrorCode.UNAUTHORIZED, ErrorDescription.UNAUTHORIZED, 'audience verification failed')
    }
    const publicKey = getPlatformPublicKey(assignedPlatform)
    const verifyOutcome = verifyTokenSignature(accessToken, publicKey)
    switch (verifyOutcome) {
      case VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE:
        throw new Unauthorized(VerifyTokenStatus.SIGNATURE_VERIFICATION_FAILURE as any, ErrorDescription.UNAUTHORIZED, 'signature verification failed')
      case VerifyTokenStatus.TOKEN_EXPIRED:
        throw new Unauthorized(VerifyTokenStatus.TOKEN_EXPIRED as any, ErrorDescription.UNAUTHORIZED, 'access token expired')
      case VerifyTokenStatus.SUCCESS:
        break
      default:
        throw new Unauthorized(ErrorCode.SERVER_EXCEPTION, ErrorDescription.UNAUTHORIZED, 'access token expired')
    }
    res.locals.subscriber = tokenSubscriber
    next()
  }
}
