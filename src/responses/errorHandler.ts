import { ErrorFactory } from '../factories/error.factory.js'
import { type Request, type Response, type NextFunction } from 'express'
import { InternalServerError } from './serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
export default (err: Error | ErrorFactory, req: Request, res: Response, next: NextFunction): Response | undefined => {
  if (err instanceof ErrorFactory) {
    return reportCustomError(err, res)
  }
  reportCustomError(new InternalServerError(
    ErrorCode.UNHANDLED_EXCEPTION,
    ErrorDescription.UNHANDLED_EXCEPTION,
    '').withRootError(err), res)
}
const reportCustomError = (err: ErrorFactory, res: Response) => {
  const { statusCode = 500 } = err
  return res.status(statusCode).json(err)
}
