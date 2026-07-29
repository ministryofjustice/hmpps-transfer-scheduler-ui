import { BaseRouter } from '../../../../common/routes'
import { MoveTransferToPlanningPriorityController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const MoveTransferToPlanningPriorityRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new MoveTransferToPlanningPriorityController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService)), controller.submitToApi, controller.POST)

  return router
}
