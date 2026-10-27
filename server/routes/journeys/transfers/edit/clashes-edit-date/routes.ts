import { BaseRouter } from '../../../../common/routes'
import { EditTransferClashesEditDateController } from './controller'
import { Services } from '../../../../../services'

export const EditTransferClashesEditDateRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new EditTransferClashesEditDateController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.submitToApi, controller.POST)

  return router
}
