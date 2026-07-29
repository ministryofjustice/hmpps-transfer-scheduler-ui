import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { Page } from '../../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../../middleware/journey/journeyStateGuard'
import { MoveTransferToPlanningRequestDateRoutes } from './request-date/routes'
import { MoveTransferToPlanningPriorityRoutes } from './priority/routes'
import { MoveTransferToPlanningConfirmationRoutes } from './confirmation/routes'

export const MoveTransferToPlanningRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get(
    '*any',
    Page.MOVE_TRANSFER_TO_PLANNING,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({ '*': () => undefined }),
  )

  router.use('/request-date', MoveTransferToPlanningRequestDateRoutes())
  router.use('/priority', MoveTransferToPlanningPriorityRoutes(services))
  router.use('/confirmation', MoveTransferToPlanningConfirmationRoutes())

  return router
}
