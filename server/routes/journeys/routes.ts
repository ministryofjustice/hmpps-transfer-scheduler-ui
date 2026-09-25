import { Router } from 'express'
import { Services } from '../../services'
import setUpJourneyData from '../../middleware/journey/setUpJourneyData'
import { mergeObjects } from '../../utils/utils'
import { requirePermissions } from '../../middleware/permissions/requirePermissions'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'
import { ScheduleTransferRoutes } from './schedule-a-transfer/routes'
import { UpdateTransferRoutes } from './transfers/routes'
import { PlanTransferRoutes } from './plan-a-transfer/routes'
import { BulkScheduleTransfersRoutes } from './bulk-schedule-transfers/routes'
import { Feature, requireFeatureFlag } from '../../utils/featureFlag'

export const JourneyRoutes = (services: Services) => {
  const router = Router({ mergeParams: true })

  router.use(setUpJourneyData(services.cacheStore('journey')))

  router.get('*any', (req, res, next) => {
    if (req.journeyData.prisonerDetails) {
      res.locals.prisonerDetails = req.journeyData.prisonerDetails
    }
    next()
  })

  router.use('/schedule-a-transfer', requirePermissions(UserPermissionLevel.MANAGE), ScheduleTransferRoutes(services))
  router.use('/plan-a-transfer', requirePermissions(UserPermissionLevel.MANAGE), PlanTransferRoutes(services))
  router.use('/transfers', requirePermissions(UserPermissionLevel.MANAGE), UpdateTransferRoutes(services))
  router.use(
    '/bulk-schedule-transfers',
    requirePermissions(UserPermissionLevel.MANAGE),
    requireFeatureFlag(Feature.BULK_TRANSFERS),
    BulkScheduleTransfersRoutes(services),
  )

  if (process.env.NODE_ENV === 'e2e-test') {
    router.get('/inject-journey-data', (req, res) => {
      const { data } = req.query
      const json = JSON.parse(atob(data as string))
      mergeObjects(req.journeyData, json)
      res.sendStatus(200)
    })
  }

  return router
}
