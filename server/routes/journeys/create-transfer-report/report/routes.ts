import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { CreateTransferReportShareLinkController } from './controller'

export const CreateTransferReportShareLinkRoutes = ({
  nonAssociationsService,
  prisonerAlertsService,
  caseNotesService,
  shareLinkStore,
}: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new CreateTransferReportShareLinkController(
    nonAssociationsService,
    prisonerAlertsService,
    caseNotesService,
    shareLinkStore,
  )

  get('/', controller.GET)
  post('/', controller.POST)

  return router
}
