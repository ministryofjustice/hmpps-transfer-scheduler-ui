import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import { toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { ScheduleTransferCheckAnswersRoutes } from './check-answers/routes'
import { ScheduleTransferConfirmationRoutes } from './confirmation/routes'
import { ScheduleTransferDetailsRoutes } from './transfer-details/routes'
import { ScheduleTransferConflictsRoutes } from './conflicts/routes'

export const ScheduleTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  router.use(redirectCheckAnswersMiddleware([/check-answers/, /confirmation/], [/conflicts/]))

  const START_ENTRY_PAGES: string[] = [Page.SEARCH_PRISONER]

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
      res.redirect('../transfer-details')
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

  router.use('/transfer-details', ScheduleTransferDetailsRoutes(services))
  router.use('/conflicts', ScheduleTransferConflictsRoutes())
  router.use('/check-answers', ScheduleTransferCheckAnswersRoutes(services))
  router.use('/confirmation', ScheduleTransferConfirmationRoutes())

  return router
}
