import { PlanTransferCheckAnswersController } from './controller'
import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'

export const PlanTransferCheckAnswersRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferCheckAnswersController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  get('/back', controller.BACK)

  return router
}
