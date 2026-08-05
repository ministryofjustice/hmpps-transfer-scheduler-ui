import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowsePlannedTransfersController } from './controller'
import { Page } from '../../services/auditService'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BrowsePlannedTransfersRoutes = ({ transferSchedulerService, prisonRegisterService }: Services) => {
  const { router, get } = BaseRouter()

  const controller = new BrowsePlannedTransfersController(transferSchedulerService, prisonRegisterService)

  get('/', Page.BROWSE_PLANNED_TRANSFERS, validateOnGET(schemaFactory(transferSchedulerService), '*'), controller.GET)

  return router
}
