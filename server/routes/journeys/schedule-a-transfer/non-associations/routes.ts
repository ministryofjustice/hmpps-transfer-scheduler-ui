import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferNonAssociationsController } from './controller'

export const ScheduleTransferNonAssociationsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferNonAssociationsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
