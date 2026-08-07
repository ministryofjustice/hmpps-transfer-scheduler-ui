import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../../middleware/journey/journeyStateGuard'
import { TransferCancelRoutes } from './cancel/routes'
import { EditTransferConfirmationRoutes } from './confirmation/routes'
import { EditTransferDateTimeRoutes } from './date-and-time/routes'

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

  router.use('/cancel', TransferCancelRoutes(services))
  router.use('/confirmation', EditTransferConfirmationRoutes())
  router.use('/date-and-time', EditTransferDateTimeRoutes(services))

  return router
}
