import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferConflictsController } from './controller'

export const ScheduleTransferConflictsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferConflictsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
