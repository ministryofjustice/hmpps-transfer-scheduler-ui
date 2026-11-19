import { Request, Response } from 'express'
import NonAssociationsService from '../../../../services/apis/nonAssociationsService'
import config from '../../../../config'
import CacheInterface from '../../../../data/cache/cacheInterface'
import { ShareLink } from '../../../../interfaces/shareLink'
import PrisonerAlertsService from '../../../../services/apis/prisonerAlertsService'
import CaseNotesService from '../../../../services/apis/caseNotesService'
import { randomString } from '../../../../utils/utils'

export class CreateTransferReportShareLinkController {
  constructor(
    private readonly nonAssociationsService: NonAssociationsService,
    private readonly prisonerAlertsService: PrisonerAlertsService,
    private readonly caseNotesService: CaseNotesService,
    private readonly shareLinkStore: CacheInterface<ShareLink>,
  ) {}

  GET = async (req: Request, res: Response) => {
    res.render('create-transfer-report/report/view', {
      backUrl: 'destination',
      nonAssociations: await this.nonAssociationsService
        .getPrisonerNonAssociations({ res }, req.journeyData.prisonerDetails!.prisonerNumber)
        .then(({ nonAssociations }) => nonAssociations.map(({ otherPrisonerDetails }) => otherPrisonerDetails)),
      alerts: await this.prisonerAlertsService.getAlerts({ res }, req.journeyData.prisonerDetails!.prisonerNumber),
      caseNotes: await this.caseNotesService.getCaseNotes({ res }, req.journeyData.prisonerDetails!.prisonerNumber),
      shareLink: req.journeyData.createTransferReport!.linkId,
      ingressUrl: config.ingressUrl,
    })
  }

  POST = async (req: Request, res: Response) => {
    const linkId = randomString(8)
    await this.shareLinkStore.set(
      linkId,
      {
        prisonNumber: req.journeyData.prisonerDetails!.prisonerNumber,
        destination: req.journeyData.createTransferReport!.destination!.code,
      },
      7 * 24 * 3600,
    )

    req.journeyData.createTransferReport!.linkId = linkId

    res.redirect(req.originalUrl)
  }
}
