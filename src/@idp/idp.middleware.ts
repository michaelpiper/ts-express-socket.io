import * as url from 'node:url'
import { type Request, type Response, type NextFunction } from 'express'
export default class IdpMiddlewares {
  idpUrlFormatter (req: Request, res: Response, next: NextFunction) {
    if (req.secure) {
      next()
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      res.redirect(url.format({
        protocol: 'https',
        host: req.get('host'),
        pathname: req.originalUrl
      }))
    } else {
      res.status(400).json({
        error: 'invalid_request',
        error_description: 'do yourself a favor and only use https'
      })
    }
  }
}
