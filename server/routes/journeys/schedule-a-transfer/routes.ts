import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import { toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { ScheduleTransferDateTimeRoutes } from './date-and-time/routes'
import { ScheduleTransferDestinationRoutes } from './destination/routes'
import { ScheduleTransferReasonRoutes } from './reason/routes'
import { ScheduleTransferLogisticsRoutes } from './logistics/routes'
import { ScheduleTransferCommentsRoutes } from './comments/routes'

export const ScheduleTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  router.use(redirectCheckAnswersMiddleware([/check-answers/, /confirmation/]))

  const START_ENTRY_PAGES: string[] = [Page.SEARCH_PRISONER, Page.MANAGE_TRANSFER]

  get('/start/:prisonNumber', services.populatePrisonerMiddleware, (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      const lastLandmark = res.locals.breadcrumbs.last()
      req.journeyData.scheduleTransfer = {
        backUrl:
          lastLandmark && START_ENTRY_PAGES.includes(lastLandmark.alias || '')
            ? lastLandmark.href
            : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails.prisonerNumber}`,
        historyQuery: encodeURIComponent(String(req.query['history'])),
      }
      res.redirect('../date-and-time')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.SCHEDULE_TRANSFER,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({}),
  )

  router.use('/date-and-time', ScheduleTransferDateTimeRoutes())
  router.use('/destination', ScheduleTransferDestinationRoutes(services))
  router.use('/reason', ScheduleTransferReasonRoutes(services))
  router.use('/logistics', ScheduleTransferLogisticsRoutes(services))
  router.use('/comments', ScheduleTransferCommentsRoutes())

  return router
}
