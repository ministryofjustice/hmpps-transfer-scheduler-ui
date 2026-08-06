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

  postScheduledTransfer(
    context: ApiRequestContext,
    prisonNumber: string,
    request: components['schemas']['CreateTransferRequest'],
  ) {
    return this.apiClient
      .withContext(context)
      .post<components['schemas']['Transfer']>({ path: `/transfers/${prisonNumber}`, data: request })
  }

  searchTransfers(
    context: ApiRequestContext,
    request: components['schemas']['ScheduledSearchRequest'] | components['schemas']['PlanningSearchRequest'],
  ) {
    return this.apiClient
      .withContext({ ...context, readOnly: true })
      .post<components['schemas']['TransferSearchResponse']>({
        path: `/search/prisons/${context.res.locals.user.getActiveCaseloadId()}/transfers`,
        data: request,
      })
  }

  async getTransfer(context: ApiRequestContext, transferId: string) {
    try {
      return await this.apiClient.withContext(context).get<components['schemas']['Transfer']>({
        path: `/transfers/${transferId}`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }
  }

  async getTransferAuditHistory(context: ApiRequestContext, transferId: string) {
    try {
      return await this.apiClient.withContext(context).get<components['schemas']['AuditHistory']>({
        path: `/transfers/${transferId}/history`,
      })
    } catch (error) {
      return this.handleGetError(error)
    }
  }

  updateTransfer(
    context: ApiRequestContext,
    transferId: string,
    request: components['schemas']['TransferActions']['actions'][0],
    reason?: string,
  ) {
    const data: components['schemas']['TransferActions'] = {
      actions: [request],
    }
    if (reason) data.reason = reason
    return this.apiClient.withContext(context).put<components['schemas']['AuditHistory']>({
      path: `/transfers/${transferId}`,
      data,
    })
  }

  private handleGetError = (error: unknown) => {
    const statusCode = (error as { data?: { status?: number } })?.data?.status
    if (statusCode && statusCode >= 400 && statusCode <= 499) return null
    throw error
  }
}
