import { Services } from '../../../../../services'
import { BaseRouter } from '../../../../common/routes'
import { SchedulePlanController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'

export const SchedulePlanRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new SchedulePlanController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  return router
}
