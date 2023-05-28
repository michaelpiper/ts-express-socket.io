import express from 'express'
import IdpMiddleware from './idp.middleware.js'
import * as path from 'node:path'
import helmet from 'helmet'
import idpProvider from './idp.provider.js'
import interactionRouter from './account/routes/interaction.route.js'
import zeroant from '../loaders/zeroant.js'
import { RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ZeroantContext } from 'loaders/zeroant.context.js'
// import { type IncomingMessage, type ServerResponse } from 'http'
export default class ApiRouteEntry extends RegistryRouteEntryFactory {
  router = express()
  name = '/idp'
  middleware: IdpMiddleware
  directives: any
  constructor (context: ZeroantContext) {
    super(context)
    this.context = context
    this.middleware = new IdpMiddleware()
    this.directives = helmet.contentSecurityPolicy.getDefaultDirectives()
    delete this.directives['form-action']
    this.buildRoutes()
  }

  buildRoutes () {
    this.router.use(helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: this.directives
      }
    }))
    const fileUrl = new URL('.', import.meta.url)
    console.log(path.join(fileUrl.pathname, 'views'))
    this.router.set('view engine', 'ejs')
    this.router.set('views', path.join(fileUrl.pathname, 'views'))
    if (zeroant.config.isProd) {
      this.router.enable('trust proxy')
      idpProvider.proxy = true
      this.router.use(this.middleware.idpUrlFormatter)
    }
    this.router.use('/interaction', interactionRouter)
    this.router.use(idpProvider.callback() as any)
  }
}
