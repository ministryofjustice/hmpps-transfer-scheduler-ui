import { BaseRouter } from '../../../common/routes'
import { PlanTransferReasonController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from '../../transfers/edit/reason/schema'

export const PlanTransferReasonRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferReasonController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService)), controller.POST)

  return router
}
