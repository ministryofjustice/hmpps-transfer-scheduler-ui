import { RequestHandler } from 'express'

export const permissionsMiddleware: RequestHandler = async (_req, res, next) => {
  if (!res.locals.feComponents?.sharedData?.services.find(({ id }) => id === 'court-appearance-scheduler')) {
    return res.render('pages/service-not-enabled')
  }
  return next()
}
