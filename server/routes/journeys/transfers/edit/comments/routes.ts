import { BaseRouter } from '../../../../common/routes'
import { EditTransferCommentsController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditTransferCommentsRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferCommentsController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
