import { MoveTransferToPlanningConfirmationController } from './controller'
import { BaseRouter } from '../../../../common/routes'

export const MoveTransferToPlanningConfirmationRoutes = () => {
  const { router, get } = BaseRouter()
  const controller = new MoveTransferToPlanningConfirmationController()

  get('/', controller.GET)

  return router
}
