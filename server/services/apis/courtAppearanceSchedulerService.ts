import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { components } from '../../@types/transferSchedulerApi'

export default class CourtAppearanceSchedulerService {
  private restClient: CustomRestClient

  constructor(protected readonly authenticationClient: AuthenticationClient) {
    this.restClient = new CustomRestClient(
      'Court Appearance Scheduler API',
      config.apis.courtAppearanceScheduler,
      logger,
      authenticationClient,
      false,
      (retry?: boolean) => (err: Error, res: SuperAgentResponse) => {
        if (!retry) return false
        if (err) return true
        if (res?.statusCode) {
          return res.statusCode >= 500
        }
        return undefined
      },
    )
  }

  getClashes(context: ApiRequestContext, prisonNumber: string, start: string, end: string) {
    const data: components['schemas']['ClashRequest'] = {
      personIdentifiers: [{ type: 'PRISON_NUMBER', value: prisonNumber }],
      ranges: [{ start, end }],
    }
    return this.restClient.withContext({ ...context, readOnly: true }).post<components['schemas']['ClashResponse']>({
      path: '/search/people/clashes',
      data,
    })
  }
}
