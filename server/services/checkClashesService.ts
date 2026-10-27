import CourtAppearanceSchedulerService from './apis/courtAppearanceSchedulerService'
import ExternalMovementsService from './apis/externalMovementsService'
import TransferSchedulerService from './apis/transferSchedulerService'
import { ApiRequestContext } from '../data/customRestClient'
import { Clash } from './apis/model/clash'

export default class CheckClashesService {
  constructor(
    private readonly courtAppearanceSchedulerService: CourtAppearanceSchedulerService,
    private readonly externalMovementsService: ExternalMovementsService,
    private readonly transferSchedulerService: TransferSchedulerService,
  ) {}

  async getClashes(
    context: ApiRequestContext,
    prisonNumber: string,
    start: string,
    end: string,
  ): Promise<Clash[] | null> {
    try {
      const [courtClashes, tapClashes, transferClashes] = await Promise.all([
        this.courtAppearanceSchedulerService.getClashes(context, prisonNumber, start, end),
        this.externalMovementsService.getClashes(context, prisonNumber, start, end),
        this.transferSchedulerService.getClashes(context, prisonNumber, start, end),
      ])

      return [
        ...courtClashes.data.flatMap(itm => itm.clashes.map(clash => ({ ...clash, type: 'Court appearance' }))),
        ...tapClashes.data.flatMap(itm => itm.clashes.map(clash => ({ ...clash, type: 'Temporary absence' }))),
        ...transferClashes.data.flatMap(itm => itm.clashes.map(clash => ({ ...clash, type: 'Transfer' }))),
      ]
    } catch {
      return null
    }
  }
}
