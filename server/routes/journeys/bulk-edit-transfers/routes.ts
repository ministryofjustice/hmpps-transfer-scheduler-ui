import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import redirectCheckAnswersMiddleware from '../../../middleware/journey/redirectCheckAnswersMiddleware'
import { validate } from '../../../middleware/validation/validationMiddleware'
import { schema } from '../../bulk-edit-transfers/schema'
import { BulkEditTransfersSearchTransfersController } from '../../bulk-edit-transfers/controller'
import { BulkEditTransfersEditListRoutes } from './edit-list/routes'
import { BulkEditTransfersCheckAnswersRoutes } from './check-answers/routes'
import { BulkEditTransfersConfirmationRoutes } from './confirmation/routes'

export const BulkEditTransfersRoutes = (services: Services) => {
  const { router, get, post } = BaseRouter()
  const { transferSchedulerService, prisonRegisterService } = services

  router.use(redirectCheckAnswersMiddleware([/check-answers/, /confirmation/]))

  const controller = new BulkEditTransfersSearchTransfersController(transferSchedulerService, prisonRegisterService)

  post('/start', validate(schema), controller.POST)

  get('*any', Page.BULK_SCHEDULE_TRANSFERS, preventNavigationToExpiredJourneys(), journeyStateGuard({}))

  router.use('/edit-list', BulkEditTransfersEditListRoutes(services))
  router.use('/check-answers', BulkEditTransfersCheckAnswersRoutes(services))
  router.use('/confirmation', BulkEditTransfersConfirmationRoutes())

  return router
}
