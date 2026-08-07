import { BaseRouter } from '../../../../common/routes'
import { EditTransferDestinationController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const EditTransferDestinationRoutes = ({ transferSchedulerService, prisonRegisterService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferDestinationController(transferSchedulerService, prisonRegisterService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.submitToApi, controller.POST)

  return router
}
