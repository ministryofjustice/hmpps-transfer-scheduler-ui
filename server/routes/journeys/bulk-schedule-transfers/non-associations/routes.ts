import { BaseRouter } from '../../../common/routes'
import { BulkScheduleTransfersNonAssociationsController } from './controller'

export const BulkScheduleTransfersNonAssociationsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkScheduleTransfersNonAssociationsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
