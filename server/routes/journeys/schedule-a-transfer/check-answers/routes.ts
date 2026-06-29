import { ScheduleTransferCheckAnswersController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'

export const ScheduleTransferCheckAnswersRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferCheckAnswersController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  get('/back', controller.BACK)

  return router
}
