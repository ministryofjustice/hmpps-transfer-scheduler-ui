import { BaseRouter } from '../../../../common/routes'
import { EditTransferNonAssociationsController } from './controller'
import { Services } from '../../../../../services'

export const EditTransferNonAssociationsRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferNonAssociationsController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
