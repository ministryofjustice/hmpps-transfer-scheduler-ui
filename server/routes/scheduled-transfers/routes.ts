import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BrowseScheduledTransfersController } from './controller'
import { Page } from '../../services/auditService'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const BrowseScheduledTransfersRoutes = ({ transferSchedulerService, prisonRegisterService }: Services) => {
  const { router, get } = BaseRouter()

  const controller = new BrowseScheduledTransfersController(transferSchedulerService, prisonRegisterService)

  get('/', Page.BROWSE_SCHEDULED_TRANSFERS, validateOnGET(schema, '*'), controller.GET)

  return router
}
