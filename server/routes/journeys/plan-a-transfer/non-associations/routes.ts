import { BaseRouter } from '../../../common/routes'
import { PlanTransferNonAssociationsController } from './controller'

export const PlanTransferNonAssociationsRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferNonAssociationsController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
