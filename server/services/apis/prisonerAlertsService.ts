import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'

export default class PrisonerAlertsService {
  private restClient: CustomRestClient

  constructor(protected readonly authenticationClient: AuthenticationClient) {
    this.restClient = new CustomRestClient(
      'Prisoner Alerts API',
      config.apis.prisonerAlerts,
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

  getAlerts(context: ApiRequestContext, prisonNumber: string) {
    return this.restClient.withContext(context).get({
      path: `/prisoners/${prisonNumber}/alerts?isActive=true`,
    })
  }
}
