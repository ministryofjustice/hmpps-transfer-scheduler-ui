import { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { Response as SuperAgentResponse } from 'superagent'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'
import { PrisonerNonAssociations } from '../../@types/nonAssociations'

export default class NonAssociationsService {
  private apiClient: CustomRestClient

  constructor(authenticationClient: AuthenticationClient) {
    this.apiClient = new CustomRestClient(
      'Non Associations API',
      config.apis.nonAssociationsApi,
      logger,
      authenticationClient,
      true,
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

  async getPrisonerNonAssociations(context: ApiRequestContext, prisonNumber: string) {
    return this.apiClient.withContext(context).get<PrisonerNonAssociations>({
      path: `/prisoner/${prisonNumber}/non-associations?includeOtherPrisons=true&includeOpen=true&includeClosed=false`,
    })
  }
}
