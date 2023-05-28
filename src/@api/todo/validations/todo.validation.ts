import { body } from 'express-validator'
export const storeValidation = [
  body('task')
    .isString().withMessage('must be string')
    .exists().withMessage('is required'),
  body('isCompleted')
    .isBoolean().withMessage('must be boolean')
    .exists().withMessage('is required')
]
