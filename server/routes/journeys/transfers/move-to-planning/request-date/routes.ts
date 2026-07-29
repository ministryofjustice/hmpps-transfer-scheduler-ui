import { BaseRouter } from '../../../../common/routes'
import { MoveTransferToPlanningRequestDateController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const MoveTransferToPlanningRequestDateRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new MoveTransferToPlanningRequestDateController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
