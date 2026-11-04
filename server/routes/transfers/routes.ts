import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { ManageTransferController } from './controller'
import { Page } from '../../services/auditService'
import { TransferReportRoutes } from './report/routes'

export const ManageTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()
  const { populateTransferMiddleware, prisonRegisterService } = services

  const controller = new ManageTransferController(prisonRegisterService)

  get('/:id', Page.MANAGE_TRANSFER, populateTransferMiddleware({ withHistory: true }), controller.GET)

  router.use('/:id/report', TransferReportRoutes(services))

  return router
}
