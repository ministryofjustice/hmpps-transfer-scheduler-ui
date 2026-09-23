import { NextFunction, Request, Response } from 'express'
import { HmppsUser } from '../interfaces/hmppsUser'
import config from '../config'

export enum Feature {
  BULK_TRANSFERS = 'BULK_TRANSFERS',
}

export const featureEnabled = (user: HmppsUser, feature: Feature) => {
  switch (feature) {
    case Feature.BULK_TRANSFERS:
      return config.featureToggles.enableBulkTransfers.includes(user.getActiveCaseloadId() ?? '')
    default:
      return false
  }
}

export const requireFeatureFlag = (feature: Feature) => (req: Request, res: Response, next: NextFunction) => {
  if (req.middleware?.enabledFeatures?.includes(feature)) {
    return next()
  }
  return res.notFound()
}

export const populateEnabledFeatures = (req: Request, res: Response, next: NextFunction) => {
  const features: Feature[] = []

  if (featureEnabled(res.locals.user, Feature.BULK_TRANSFERS)) features.push(Feature.BULK_TRANSFERS)

  req.middleware ??= {}
  req.middleware.enabledFeatures = features
  next()
}
