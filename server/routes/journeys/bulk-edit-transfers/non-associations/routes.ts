import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersNonAssociationsController } from './controller'

export const BulkEditTransfersNonAssociationsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkEditTransfersNonAssociationsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
