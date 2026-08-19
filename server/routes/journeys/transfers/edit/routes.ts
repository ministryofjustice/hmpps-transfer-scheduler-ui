import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../../middleware/journey/journeyStateGuard'
import { TransferCancelRoutes } from './cancel/routes'
import { EditTransferConfirmationRoutes } from './confirmation/routes'
import { EditTransferDateTimeRoutes } from './date-and-time/routes'
import { EditTransferCommentsRoutes } from './comments/routes'
import { EditTransferDestinationRoutes } from './destination/routes'
import { EditTransferLogisticsRoutes } from './logistics/routes'
import { EditTransferPriorityRoutes } from './priority/routes'
import { EditTransferReasonRoutes } from './reason/routes'
import { EditTransferRequestDateRoutes } from './request-date/routes'
import { SchedulePlanRoutes } from './schedule-a-plan/routes'

export const EditTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get(
    '*any',
    Page.UPDATE_TRANSFER,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({ '*': () => undefined }),
  )

  router.use('/schedule-a-plan', SchedulePlanRoutes(services))
  router.use('/cancel', TransferCancelRoutes(services))
  router.use('/confirmation', EditTransferConfirmationRoutes())
  router.use('/comments', EditTransferCommentsRoutes(services))
  router.use('/date-and-time', EditTransferDateTimeRoutes(services))
  router.use('/destination', EditTransferDestinationRoutes(services))
  router.use('/logistics', EditTransferLogisticsRoutes(services))
  router.use('/priority', EditTransferPriorityRoutes(services))
  router.use('/reason', EditTransferReasonRoutes(services))
  router.use('/request-date', EditTransferRequestDateRoutes(services))

  return router
}
