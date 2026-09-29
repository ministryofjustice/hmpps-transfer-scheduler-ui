import { BulkEditTransfersConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const BulkEditTransfersConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new BulkEditTransfersConfirmationController()

  get('/', controller.GET)

  return router
}
