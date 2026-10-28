import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { ManageTransferController } from './controller'
import { Page } from '../../services/auditService'
import { TransferReportRoutes } from './report/routes'
import { Feature, requireFeatureFlag } from '../../utils/featureFlag'

export const ManageTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()
  const { populateTransferMiddleware, prisonRegisterService } = services

  const controller = new ManageTransferController(prisonRegisterService)

  get('/:id', Page.MANAGE_TRANSFER, populateTransferMiddleware({ withHistory: true }), controller.GET)

  router.use('/:id/report', requireFeatureFlag(Feature.DEV_LED), TransferReportRoutes(services))

  return router
}
