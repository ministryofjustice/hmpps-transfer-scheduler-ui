import { BaseRouter } from '../../../../common/routes'
import { EditTransferDateTimeController } from './controller'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../../services'

export const EditTransferDateTimeRoutes = ({ transferSchedulerService, checkClashesService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferDateTimeController(transferSchedulerService, checkClashesService)

  get('/', controller.GET)
  post('/', validate(schema), controller.submitToApi, controller.POST)

  return router
}
