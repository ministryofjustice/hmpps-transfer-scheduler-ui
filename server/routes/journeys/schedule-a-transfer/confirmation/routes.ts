import { ScheduleTransferConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const ScheduleTransferConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new ScheduleTransferConfirmationController()

  get('/', controller.GET)

  return router
}
