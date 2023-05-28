import { InteractionIdpController } from '../controllers/interaction.controller.js'
import idpProvider from '../../idp.provider.js'
import express from 'express'
import { InteractionIdpMiddleware } from '../middlewares/interaction.middleware.js'
const router = express()
const controller = new InteractionIdpController(idpProvider)
const middleware = new InteractionIdpMiddleware(router, idpProvider)
router.use(middleware.updateInteractionView.bind(middleware))
router.get('/:uid', middleware.setNoCache.bind(middleware), controller.retrieve.bind(controller))
router.post('/:uid/login', middleware.setNoCache.bind(middleware), middleware.body, controller.accountLogin.bind(controller))
router.post('/:uid/confirm', middleware.setNoCache.bind(middleware), middleware.body, controller.accountConfirm.bind(controller))
router.get('/:uid/abort', middleware.setNoCache.bind(middleware), controller.accountAbort.bind(controller))
router.use(middleware.sessionError.bind(middleware))
export default router
