import * as express from 'express'
import * as path from 'node:path'
import { createServer, type Server } from 'http'
import { InternalServerError } from '../responses/serverErrors/InternalServerError.serverError.js'
import { ErrorCode, ErrorDescription } from '../common/constants.js'
import { type RegistryRouteEntryFactory } from '../factories/registry.factory.js'
import { type ServerFactoryConstructor, type ServerFactory } from '../factories/server.factory.js'
import { type Config } from '../common/config/config.js'
import { type Plugin } from '../common/plugins/plugin.js'
export class ZeroantContext {
  static PORT = 8080
  _app: express.Application
  protected _server: Server
  protected _port: number
  _servers: ServerFactory[] = []
  constructor () {
    this._app = express.default()
  }

  initRoutes (routes: RegistryRouteEntryFactory[]) {
    for (const route of routes) {
      this._app.use(route.name, route.router)
    }
  }

  initMiddleware (middlewareList: express.RequestHandler[]) {
    for (const middleware of middlewareList) {
      this._app.use(middleware)
    }
  }

  listen (callback?: () => void): void {
    this.beforeStart()
    const config = this.getConfig()
    const fileUrl = new URL('.', import.meta.url)
    this._app.set('view engine', 'ejs')
    console.log('view', path.join(fileUrl.pathname, '../common/views'))
    this._app.set('views', path.join(fileUrl.pathname, '../common/views'))
    this._port = config.serverPort ?? ZeroantContext.PORT
    this._server = createServer(this._app)
    this._server.listen(this._port, () => {
      this.onStart()
      if (typeof callback === 'function') {
        callback()
      }
    })
  }

  onStart () {
    console.log('Running Express Server on port %s', this._port)
    for (const server of this._servers) {
      server.onStart()
    }
  }

  beforeStart () {
    for (const server of this._servers) {
      server.beforeStart()
    }
  }

  has (key: string) {
    return this._app.get(key) !== undefined && this._app.get(key) !== null
  }

  close () {
    for (const server of this._servers) {
      server.close()
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!this._server) {
      return
    }
    this._server.close((err) => {
      if (err != null) { throw Error() }
      console.info(new Date(), '[ZeroantContext]: Stopped')
    })
  }

  initServer (Server: ServerFactoryConstructor<ServerFactory>) {
    const server = new Server(this)
    server.initialize()
    this._servers.push(server)
    this._app.set(`server:${Server.name}`, server)
  }

  getServer <T extends ServerFactory>(Server: ServerFactoryConstructor<T>): T {
    const server = this._app.get(`server:${Server.name}`)
    if (server === null || server === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, `${Server.name} Server Not Init`)
    }
    return server
  }

  async initPlugin (plugin: Plugin) {
    this._app.set('plugin', plugin)
    await plugin.initialize()
  }

  getPlugin () {
    const plugin: Plugin = this._app.get('plugin')
    if (plugin === null || plugin === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, 'Plugin Not Init')
    }
    return plugin
  }

  async initConfig (config: Config) {
    this._app.set('config', config)
  }

  getConfig () {
    const config = this._app.get('config')
    if (config === null || config === undefined) {
      throw new InternalServerError(ErrorCode.SERVER_EXCEPTION, ErrorDescription.SERVER_EXCEPTION, 'Config Not Init')
    }
    return config
  }

  get server (): Server { return this._server }
  get plugin (): Plugin { return this.getPlugin() }
  get config (): Config { return this.getConfig() }
  get instance (): express.Application { return this._app }
}
