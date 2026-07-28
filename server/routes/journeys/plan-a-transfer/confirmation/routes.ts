import { PlanTransferConfirmationController } from './controller'
import { BaseRouter } from '../../../common/routes'

export const PlanTransferConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new PlanTransferConfirmationController()

  get('/', controller.GET)

  return router
}
