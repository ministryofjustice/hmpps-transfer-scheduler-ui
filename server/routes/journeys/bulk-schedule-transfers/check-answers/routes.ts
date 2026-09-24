import { BulkScheduleTransfersCheckAnswersController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'

export const BulkScheduleTransfersCheckAnswersRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkScheduleTransfersCheckAnswersController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  get('/back', controller.BACK)

  return router
}
