import { type NextFunction, type Request, type Response, urlencoded, type Application } from 'express'
import type Provider from 'oidc-provider'
export class InteractionIdpMiddleware {
  body = urlencoded({ extended: false })
  SessionNotFound: any
  constructor (private readonly app: Application, private readonly provider: Provider) {
  }

  setNoCache (req: Request, res: Response, next: NextFunction) {
    res.set('cache-control', 'no-store')
    next()
  }

  updateInteractionView (req: Request, res: Response, next: NextFunction) {
    const orig = res.render
    res.render = (view, locals) => {
      this.app.render(view, locals, (err, html) => {
        if (err !== undefined) { throw err }
        orig.call(res, '_layout', {
          ...locals,
          body: html
        } as any)
      })
    }
    next()
  }

  sessionError (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err !== undefined && this.SessionNotFound !== undefined && err instanceof this.SessionNotFound) {
      /* empty */
    }
    next(err)
  }
}
