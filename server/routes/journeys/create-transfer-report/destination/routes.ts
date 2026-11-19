import { BaseRouter } from '../../../common/routes'
import { CreateTransferReportDestinationController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const CreateTransferReportDestinationRoutes = ({ prisonRegisterService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new CreateTransferReportDestinationController(prisonRegisterService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(prisonRegisterService)), controller.POST)

  return router
}
