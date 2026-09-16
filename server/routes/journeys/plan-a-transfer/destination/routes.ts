import { BaseRouter } from '../../../common/routes'
import { PlanTransferDestinationController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const PlanTransferDestinationRoutes = ({ prisonRegisterService, nonAssociationsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferDestinationController(prisonRegisterService, nonAssociationsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.POST)

  return router
}
