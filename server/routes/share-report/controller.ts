import { Request, Response } from 'express'
import NonAssociationsService from '../../services/apis/nonAssociationsService'
import CacheInterface from '../../data/cache/cacheInterface'
import { ShareLink } from '../../interfaces/shareLink'
import TransferSchedulerService from '../../services/apis/transferSchedulerService'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import PrisonerAlertsService from '../../services/apis/prisonerAlertsService'
import CaseNotesService from '../../services/apis/caseNotesService'

export class TransferShareReportController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonerSearchService: PrisonerSearchApiService,
    private readonly nonAssociationsService: NonAssociationsService,
    private readonly prisonerAlertsService: PrisonerAlertsService,
    private readonly caseNotesService: CaseNotesService,
    private readonly shareLinkStore: CacheInterface<ShareLink>,
  ) {}

  GET = async (req: Request<{ id: string }>, res: Response) => {
    const shareLink = await this.shareLinkStore.get(req.params.id)
    if (!shareLink?.transferId) {
      return res.notFound()
    }

    const transfer = await this.transferSchedulerService.getTransfer({ res }, shareLink.transferId)
    if (!transfer) {
      return res.notFound()
    }

    if (!res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === transfer.destination?.code)) {
      return res.notAuthorised()
    }

    const prisoner = await this.prisonerSearchService.getPrisonerDetails({ res }, transfer.person.identifier)

    return res.render('share-report/view', {
      transfer: {
        ...transfer,
        label: transfer.stage === 'SCHEDULED' ? 'scheduled transfer' : 'planned transfer',
      },
      prisoner,
      nonAssociations: await this.nonAssociationsService
        .getPrisonerNonAssociations({ res }, prisoner.prisonerNumber)
        .then(({ nonAssociations }) => nonAssociations.map(({ otherPrisonerDetails }) => otherPrisonerDetails)),
      alerts: await this.prisonerAlertsService.getAlerts({ res }, prisoner.prisonerNumber),
      caseNotes: await this.caseNotesService.getCaseNotes({ res }, prisoner.prisonerNumber),
    })
  }
}
