import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { ManageTransferController } from './controller'
import { Page } from '../../services/auditService'

export const ManageTransferRoutes = ({ populateTransferMiddleware }: Services) => {
  const { router, get } = BaseRouter()

  const controller = new ManageTransferController()

  get('/:id', Page.MANAGE_TRANSFER, populateTransferMiddleware({ withHistory: true }), controller.GET)

  return router
}
