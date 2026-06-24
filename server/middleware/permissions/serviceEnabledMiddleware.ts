import { RequestHandler } from 'express'

// TODO: add serviceEnabledMiddleware to route after the service is registered to Micro Frontend Component
export const serviceEnabledMiddleware: RequestHandler = async (_req, res, next) => {
  if (!res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'transfer-scheduler')) {
    return res.render('pages/service-not-enabled')
  }
  return next()
}
