import { BulkScheduleTransfersConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const BulkScheduleTransfersConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new BulkScheduleTransfersConfirmationController()

  get('/', controller.GET)

  return router
}
