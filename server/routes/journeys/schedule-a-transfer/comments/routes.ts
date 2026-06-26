import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferCommentsController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const ScheduleTransferCommentsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferCommentsController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
