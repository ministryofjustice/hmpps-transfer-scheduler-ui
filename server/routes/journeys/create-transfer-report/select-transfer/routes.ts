import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { CreateTransferReportSelectTransferController } from './controller'

export const CreateTransferReportSelectTransferRoutes = ({ transferSchedulerService }: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new CreateTransferReportSelectTransferController(transferSchedulerService)

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
