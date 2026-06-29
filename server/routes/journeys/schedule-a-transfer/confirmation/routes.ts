import { ScheduleTransferConfirmationController0 } from './controller'
import { BaseRouter } from '../../../common/routes'

export const ScheduleTransferConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new ScheduleTransferConfirmationController0()

  get('/', controller.GET)

  return router
}
