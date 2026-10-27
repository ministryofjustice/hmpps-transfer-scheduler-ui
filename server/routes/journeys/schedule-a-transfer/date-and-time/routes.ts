import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferDateTimeController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../services'

export const ScheduleTransferDateTimeRoutes = ({ checkClashesService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferDateTimeController(checkClashesService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
