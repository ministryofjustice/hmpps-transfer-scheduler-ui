import { BaseRouter } from '../../../common/routes'
import { PlanTransferCommentsController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const PlanTransferCommentsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferCommentsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
