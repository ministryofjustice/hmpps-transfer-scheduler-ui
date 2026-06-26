import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferReasonController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const ScheduleTransferReasonRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferReasonController(transferSchedulerService)

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService)), controller.POST)

  return router
}
