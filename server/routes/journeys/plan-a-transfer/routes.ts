import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import { toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { PlanTransferRequestDateRoutes } from './request-date/routes'
import { PlanTransferReasonRoutes } from './reason/routes'
import { PlanTransferPriorityRoutes } from './priority/routes'
import { PlanTransferDateTimeRoutes } from './date-and-time/routes'
import { PlanTransferDestinationRoutes } from './destination/routes'
import { PlanTransferLogisticsRoutes } from './logistics/routes'
import { PlanTransferCommentsRoutes } from './comments/routes'
import { PlanTransferCheckAnswersRoutes } from './check-answers/routes'
import { PlanTransferConfirmationRoutes } from './confirmation/routes'

export const PlanTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  router.use(redirectCheckAnswersMiddleware([/check-answers/, /confirmation/]))

  const START_ENTRY_PAGES: string[] = [Page.SEARCH_PRISONER]

  get('/start/:prisonNumber', services.populatePrisonerMiddleware, (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      const lastLandmark = res.locals.breadcrumbs.last()
      req.journeyData.planTransfer = {
        backUrl:
          lastLandmark && START_ENTRY_PAGES.includes(lastLandmark.alias || '')
            ? lastLandmark.href
            : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails.prisonerNumber}`,
        historyQuery: encodeURIComponent(String(req.query['history'])),
      }
      res.redirect('../request-date')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.PLAN_TRANSFER,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({}),
  )

  router.use('/request-date', PlanTransferRequestDateRoutes())
  router.use('/reason', PlanTransferReasonRoutes(services))
  router.use('/priority', PlanTransferPriorityRoutes(services))
  router.use('/date-and-time', PlanTransferDateTimeRoutes())
  router.use('/destination', PlanTransferDestinationRoutes(services))
  router.use('/logistics', PlanTransferLogisticsRoutes(services))
  router.use('/comments', PlanTransferCommentsRoutes())
  router.use('/check-answers', PlanTransferCheckAnswersRoutes(services))
  router.use('/confirmation', PlanTransferConfirmationRoutes())

  return router
}
