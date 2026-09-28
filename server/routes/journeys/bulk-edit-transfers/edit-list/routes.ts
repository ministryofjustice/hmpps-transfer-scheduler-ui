import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersEditListController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BulkEditTransfersEditListRoutes = ({ prisonRegisterService }: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new BulkEditTransfersEditListController(prisonRegisterService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.POST)

  return router
}
