import { Request, Response } from 'express'
import NonAssociationsService from '../../../services/apis/nonAssociationsService'
import { FLASH_KEY__SHARE_LINK } from '../../../utils/constants'
import { SchemaType } from './schema'
import config from '../../../config'
import CacheInterface from '../../../data/cache/cacheInterface'
import { ShareLink } from '../../../interfaces/shareLink'
import PrisonerAlertsService from '../../../services/apis/prisonerAlertsService'
import CaseNotesService from '../../../services/apis/caseNotesService'

export class TransferReportController {
  constructor(
    private readonly nonAssociationsService: NonAssociationsService,
    private readonly prisonerAlertsService: PrisonerAlertsService,
    private readonly caseNotesService: CaseNotesService,
    private readonly shareLinkStore: CacheInterface<ShareLink>,
  ) {}

  GET = async (req: Request, res: Response) => {
    res.render('transfers/report/view', {
      showBreadcrumbs: true,
      transfer: req.middleware!.transfer,
      prisoner: res.locals.prisonerDetails,
      prisonerDetails: null, // suppress miniProfile from layout.njk
      nonAssociations: await this.nonAssociationsService
        .getPrisonerNonAssociations({ res }, res.locals.prisonerDetails!.prisonerNumber)
        .then(({ nonAssociations }) =>
          nonAssociations
            .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
            .filter(({ prisonId }) => prisonId === req.middleware!.transfer!.destination?.code),
        ),
      alerts: await this.prisonerAlertsService.getAlerts({ res }, res.locals.prisonerDetails!.prisonerNumber),
      caseNotes: await this.caseNotesService.getCaseNotes({ res }, res.locals.prisonerDetails!.prisonerNumber),
      shareLink: req.flash(FLASH_KEY__SHARE_LINK)[0],
      ingressUrl: config.ingressUrl,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const linkId = this.randomString(8)
    await this.shareLinkStore.set(linkId, { transferId: req.middleware!.transfer!.id }, req.body.duration * 3600)
    req.flash(FLASH_KEY__SHARE_LINK, linkId)
    res.redirect(req.originalUrl)
  }

  private randomString = (length: number, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') => {
    let result = ''
    for (let i = length; i > 0; i -= 1) result += chars[Math.floor(Math.random() * chars.length)]
    return result
  }
}
