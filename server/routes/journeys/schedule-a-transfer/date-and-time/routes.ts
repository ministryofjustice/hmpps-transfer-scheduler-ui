import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferDateTimeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const ScheduleTransferDateTimeRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferDateTimeController()

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
