import { BaseRouter } from '../../../../common/routes'
import { EditTransferConfirmationController } from './controller'

export const EditTransferConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new EditTransferConfirmationController()

  get('/', controller.GET)

  return router
}
