import { BaseRouter } from '../../../common/routes'
import { PlanTransferDestinationController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const PlanTransferDestinationRoutes = ({ prisonRegisterService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferDestinationController(prisonRegisterService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.POST)

  return router
}
