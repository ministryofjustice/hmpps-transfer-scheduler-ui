import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferClashesController } from './controller'

export const ScheduleTransferClashesRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferClashesController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
