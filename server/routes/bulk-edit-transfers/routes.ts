import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { BulkEditTransfersSearchTransfersController } from './controller'
import { Page } from '../../services/auditService'
import { validate, validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const BulkEditTransfersSearchTransfersRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
}: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new BulkEditTransfersSearchTransfersController(transferSchedulerService, prisonRegisterService)

  get('/', Page.BULK_EDIT_TRANSFERS, validateOnGET(schema, '*'), controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
