import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { TransferReportController } from './controller'
import { Page } from '../../../services/auditService'

export const TransferReportRoutes = ({
  populateTransferMiddleware,
  nonAssociationsService,
  shareLinkStore,
}: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new TransferReportController(nonAssociationsService, shareLinkStore)

  get('/', Page.TRANSFER_REPORT, populateTransferMiddleware({ withHistory: false }), controller.GET)
  post('/', populateTransferMiddleware({ withHistory: false }), controller.POST)

  return router
}
