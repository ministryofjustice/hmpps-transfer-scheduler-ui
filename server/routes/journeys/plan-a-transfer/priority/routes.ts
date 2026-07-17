import { BaseRouter } from '../../../common/routes'
import { PlanTransferPriorityController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const PlanTransferPriorityRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferPriorityController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService)), controller.POST)

  return router
}
