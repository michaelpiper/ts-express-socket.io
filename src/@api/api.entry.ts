
import { Router } from 'express'
import bodyParser from 'body-parser'
import ApiMiddleware from './api.middleware.js'
import todoListRoutes from './todo/routes/todo.route.js'
import errorHandler from '../responses/errorHandler.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import cors from 'cors'
export default class ApiRouteEntry extends RegistryRouteEntryFactory {
  middleware = new ApiMiddleware()
  public router: Router = Router()
  public name = '/api'
  constructor (readonly context: ZeroantContext) {
    super(context)
    this.buildRoutes()
  }

  buildRoutes () {
    this.router.use(bodyParser.urlencoded({ extended: false }))
    this.router.use(bodyParser.json({ type: '*/*' }))
    this.router.use(cors())
    this.router.use('/todos', todoListRoutes)
    this.router.use(errorHandler)
    this.router.use(this.middleware.apiRouteNotFound)
  }
}
