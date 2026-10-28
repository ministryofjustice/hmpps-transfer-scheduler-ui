import { Response as SuperAgentResponse } from 'superagent'
import type { AuthenticationClient } from '@ministryofjustice/hmpps-auth-clients'
import { format, subMonths } from 'date-fns'
import CustomRestClient, { ApiRequestContext } from '../../data/customRestClient'
import config from '../../config'
import logger from '../../../logger'

export default class CaseNotesService {
  private restClient: CustomRestClient

  constructor(protected readonly authenticationClient: AuthenticationClient) {
    this.restClient = new CustomRestClient(
      'Case notes API',
      config.apis.caseNotes,
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

  getCaseNotes(context: ApiRequestContext, prisonNumber: string) {
    return this.restClient.withContext({ ...context, readOnly: true }).post({
      path: `/search/case-notes/${prisonNumber}`,
      data: {
        includeSensitive: false,
        page: 1,
        size: 2000,
        sort: 'createdAt,DESC',
        occurredFrom: `${format(subMonths(new Date(), 1), 'yyyy-MM-dd')}T00:00:00`,
      },
    })
  }
}
