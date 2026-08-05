import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import { ResQuerySchemaType } from './schema'
import { components } from '../../@types/transferSchedulerApi'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { formatInputDate } from '../../utils/dateTimeUtils'
import PrisonRegisterService from '../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../services/apis/transferSchedulerService'

export class BrowsePlannedTransfersController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
  ) {}

  private PAGE_SIZE = 10

  private DEFAULT_SORT = 'start,asc'

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    if (resQuery.searchTerm?.trim()) {
      res.setAuditDetails.searchTerm(resQuery.searchTerm.trim())
    }

    const priorityOptions = await this.transferSchedulerService.getReferenceData({ res }, 'transfer-priority')

    let searchResponse: components['schemas']['TransferSearchResponse'] | undefined
    let results: components['schemas']['Transfer'][] = []

    try {
      if (resQuery.validated) {
        const requestBody: components['schemas']['TransferPrisonSearchRequest'] = {
          start: resQuery.validated.start,
          end: resQuery.validated.end,
          sort: resQuery.validated.sort ?? this.DEFAULT_SORT,
          page: resQuery.validated.page || 1,
          size: this.PAGE_SIZE,
          stage: 'PLANNING',
        }

        if (resQuery.validated.destination) requestBody.destinationCodes = [resQuery.validated.destination]
        if (resQuery.validated.reason) requestBody.reasonCodes = [resQuery.validated.reason]
        if (resQuery.validated.logistics) requestBody.logisticsCodes = [resQuery.validated.logistics]
        if (resQuery.validated.searchTerm) requestBody.query = resQuery.validated.searchTerm
        if (resQuery.validated.status?.length) {
          requestBody.statusCodes = resQuery.validated.status
        }
        if (resQuery.validated.priority?.length) {
          requestBody.priorityCodes = resQuery.validated.priority as ('1' | '2' | '3')[]
        }

        searchResponse = await this.transferSchedulerService.searchTransfers({ res }, requestBody)
        results = searchResponse?.content ?? []
      }

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        resQuery?.validated?.page ?? 1,
        searchResponse?.metadata?.totalElements ?? 0,
        results.length,
        `?page={page}&sort=${resQuery?.sort ?? this.DEFAULT_SORT}&${[
          `searchTerm=${resQuery?.searchTerm ?? ''}`,
          `start=${resQuery?.start ?? ''}`,
          `end=${resQuery?.end ?? ''}`,
          `destination=${resQuery?.destination ?? ''}`,
          `reason=${resQuery?.reason ?? ''}`,
          `logistics=${resQuery?.logistics ?? ''}`,
          // eslint-disable-next-line no-nested-ternary
          ...(Array.isArray(resQuery?.status)
            ? resQuery.status.map(itm => `status=${itm}`)
            : resQuery.status
              ? [`status=${resQuery.status}`]
              : []),
          // eslint-disable-next-line no-nested-ternary
          ...(Array.isArray(resQuery?.priority)
            ? resQuery.priority.map(itm => `priority=${itm}`)
            : resQuery.priority
              ? [`priority=${resQuery.priority}`]
              : []),
        ].join('&')}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('planned-transfers/view', {
      showBreadcrumbs: true,
      prisons:
        (await this.prisonRegisterService.getPrisons({ res }))?.filter(
          ({ code }) => code !== res.locals.user.getActiveCaseloadId(),
        ) ?? [],
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      priorityOptions,
      hasValidationError: !resQuery.validated,
      results,
      searchTerm: resQuery.searchTerm,
      start: resQuery.validated?.start ? formatInputDate(resQuery.validated.start) : resQuery.start,
      end: resQuery.validated?.end ? formatInputDate(resQuery.validated.end) : resQuery.end,
      destination: resQuery.destination,
      reason: resQuery.reason,
      logistics: resQuery.logistics,
      status: resQuery.status,
      priority: resQuery.priority,
      sort: resQuery?.sort ?? this.DEFAULT_SORT,
    })
  }
}
