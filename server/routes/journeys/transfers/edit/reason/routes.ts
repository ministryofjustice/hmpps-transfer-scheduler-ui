import { BaseRouter } from '../../../../common/routes'
import { EditTransferReasonController } from './controller'
import { Services } from '../../../../../services'
import { validate } from '../../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from '../../../schedule-a-transfer/reason/schema'

export const EditTransferReasonRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferReasonController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService)), controller.submitToApi, controller.POST)

  return router
}
