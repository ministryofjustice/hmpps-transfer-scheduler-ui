import { BaseRouter } from '../../../../common/routes'
import { EditTransferClashesController } from './controller'

export const EditTransferClashesRoutes = () => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferClashesController()

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
