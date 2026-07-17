import { BaseRouter } from '../../../common/routes'
import { PlanTransferRequestDateController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const PlanTransferRequestDateRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferRequestDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
