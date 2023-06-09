import { type RequestHandler, type Router } from 'express'
import { type ZeroantContext } from '../loaders/zeroant.context.js'
import { type AddonConfigFactory } from './addon.config.js'
import { type AddonPluginFactory } from './addon.plugin.js'
import { type ServerFactory, type ServerFactoryConstructor } from './server.factory.js'

export abstract class RegistryRouteEntryFactory {
  name: string
  abstract router: Router
  constructor (protected context: ZeroantContext) {
  }

  buildRoutes () {
  }
}

export default abstract class RegistryFactory {
  static readonly configs: AddonConfigFactory[]
  abstract readonly plugins: AddonPluginFactory[]
  abstract readonly servers: Array<ServerFactoryConstructor<ServerFactory>>
  abstract readonly middleware: RequestHandler[]
  abstract readonly routes: RegistryRouteEntryFactory[]
}
