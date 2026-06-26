import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { CodedDescription } from '../../@types/journeys'
import { components, operations } from '../../@types/transferSchedulerApi'

export default class TransferSchedulerService {
  private apiClient: CustomRestClient

  constructor(protected readonly authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'Transfer Scheduler API',
      config.apis.transferSchedulerApi,
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

  async getReferenceData(
    context: ApiRequestContext,
    domain: operations['getDomain']['parameters']['path']['domain'],
  ): Promise<CodedDescription[]> {
    return (
      await this.apiClient
        .withContext(context)
        .get<components['schemas']['ReferenceDataResponse']>({ path: `/reference-data/${domain}` })
    ).items
  }
}
