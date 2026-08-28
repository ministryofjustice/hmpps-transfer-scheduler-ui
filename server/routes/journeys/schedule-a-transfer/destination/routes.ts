import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferDestinationController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const ScheduleTransferDestinationRoutes = ({ prisonRegisterService, nonAssociationsService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferDestinationController(prisonRegisterService, nonAssociationsService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.POST)

  return router
}
