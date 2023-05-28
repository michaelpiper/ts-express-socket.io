import { UnprocessableEntity } from '../responses/clientErrors/unprocessableEntity.clientError.js'
import { validationResult } from 'express-validator'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
import { type Request } from 'express'
export const validator = (req: Request): void => {
  const errorFormatter = ({ msg, param }: { msg: string, param: string }) => {
    return `${param} ${msg}`
  }
  const result = validationResult(req).formatWith(errorFormatter)
  if (!result.isEmpty()) {
    throw new UnprocessableEntity(ErrorCode.INVALID_INPUT, ErrorDescription.INVALID_INPUT, result.array())
  }
}
