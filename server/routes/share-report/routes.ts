import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { TransferShareReportController } from './controller'
import { Page } from '../../services/auditService'

export const TransferShareReportRoutes = ({
  transferSchedulerService,
  prisonerSearchService,
  nonAssociationsService,
  prisonerAlertsService,
  caseNotesService,
  shareLinkStore,
}: Services) => {
  const { router, get } = BaseRouter()

  const controller = new TransferShareReportController(
    transferSchedulerService,
    prisonerSearchService,
    nonAssociationsService,
    prisonerAlertsService,
    caseNotesService,
    shareLinkStore,
  )

  get('/:id', Page.TRANSFER_SHARE_REPORT, controller.GET)

  return router
}
