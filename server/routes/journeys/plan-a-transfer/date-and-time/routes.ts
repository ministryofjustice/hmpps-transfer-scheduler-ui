import { BaseRouter } from '../../../common/routes'
import { PlanTransferDateTimeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const PlanTransferDateTimeRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferDateTimeController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
