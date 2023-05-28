/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express'
import { TodoApiController } from '../controllers/todo.controller.js'
import { storeValidation } from '../validations/todo.validation.js'
const router = Router()
const controller = new TodoApiController()
router.post('/store', storeValidation, controller.store)
router.get('/list', controller.list)
export default router
