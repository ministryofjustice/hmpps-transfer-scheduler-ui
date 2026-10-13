import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import { validate } from '../../../middleware/validation/validationMiddleware'
import { schema } from '../../bulk-edit-transfers/schema'
import { BulkEditTransfersSearchTransfersController } from '../../bulk-edit-transfers/controller'
import { BulkEditTransfersEditListRoutes } from './edit-list/routes'
import { BulkEditTransfersCheckAnswersRoutes } from './check-answers/routes'
import { BulkEditTransfersConfirmationRoutes } from './confirmation/routes'
import { BulkEditTransfersDetailsRoutes } from './transfer-details/routes'
import { BulkEditTransfersSearchPrisonersRoutes } from './search-prisoner/routes'
import { BulkEditTransfersChangeDetailsRoutes } from './change-details/routes'
import { BulkEditTransfersNonAssociationsRoutes } from './non-associations/routes'

export const BulkEditTransfersRoutes = (services: Services) => {
  const { router, get, post } = BaseRouter()
  const { transferSchedulerService, prisonRegisterService } = services

  const controller = new BulkEditTransfersSearchTransfersController(transferSchedulerService, prisonRegisterService)

  post('/start', validate(schema), controller.POST)

  get('*any', Page.BULK_EDIT_TRANSFERS, preventNavigationToExpiredJourneys(), journeyStateGuard({}))

  router.use('/edit-list', BulkEditTransfersEditListRoutes(services))
  router.use('/transfer-details', BulkEditTransfersDetailsRoutes(services))
  router.use('/search-prisoner', BulkEditTransfersSearchPrisonersRoutes(services))
  router.use('/non-associations', BulkEditTransfersNonAssociationsRoutes())
  router.use('/check-answers', BulkEditTransfersCheckAnswersRoutes(services))
  router.use('/change-details', BulkEditTransfersChangeDetailsRoutes(services))
  router.use('/confirmation', BulkEditTransfersConfirmationRoutes())

  return router
}
