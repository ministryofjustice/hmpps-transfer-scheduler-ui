import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import { format } from 'date-fns'
import { ResQuerySchemaType, SchemaType } from './schema'
import { components } from '../../@types/transferSchedulerApi'
import { getApiUserErrorMessage } from '../../utils/utils'
import { setPaginationLocals } from '../../views/partials/simplePagination/utils'
import { formatInputDate } from '../../utils/dateTimeUtils'
import PrisonRegisterService from '../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../services/apis/transferSchedulerService'
import { FLASH_KEY__VALIDATION_ERRORS } from '../../utils/constants'

export class BulkEditTransfersSearchTransfersController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
  ) {}

  private PAGE_SIZE = 10

  private DEFAULT_SORT = 'start,asc'

  GET = async (_req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    let searchResponse: components['schemas']['TransferSearchResponse'] | undefined
    let results: components['schemas']['Transfer'][] = []

    try {
      if (resQuery.validated) {
        const requestBody: components['schemas']['ScheduledSearchRequest'] = {
          start: resQuery.validated.start,
          end: resQuery.validated.end,
          sort: resQuery.validated.sort ?? this.DEFAULT_SORT,
          page: resQuery.validated.page || 1,
          size: this.PAGE_SIZE,
          stage: 'SCHEDULED',
          statusCodes: ['SCHEDULED'],
        }

        if (resQuery.validated.destination) requestBody.destinationCodes = [resQuery.validated.destination]
        if (resQuery.validated.reason) requestBody.reasonCodes = [resQuery.validated.reason]
        if (resQuery.validated.logistics) requestBody.logisticsCodes = [resQuery.validated.logistics]

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
          `start=${resQuery?.start ?? ''}`,
          `end=${resQuery?.end ?? ''}`,
          `destination=${resQuery?.destination ?? ''}`,
          `reason=${resQuery?.reason ?? ''}`,
          `logistics=${resQuery?.logistics ?? ''}`,
        ].join('&')}`,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    const prisons =
      (await this.prisonRegisterService.getPrisons({ res }))?.filter(
        ({ code }) => code !== res.locals.user.getActiveCaseloadId(),
      ) ?? []
    const reasons = await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason')
    const logisticsOptions = await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics')

    const selectedFilters: string[] = []
    if (resQuery.validated?.start && resQuery.validated?.end) {
      selectedFilters.push(
        `${format(resQuery.validated.start, 'd MMMM yyyy')} to ${format(resQuery.validated.end, 'd MMMM yyyy')}`,
      )
    }
    if (resQuery.validated?.destination) {
      selectedFilters.push(prisons.find(({ code }) => code === resQuery.validated?.destination)?.description ?? '')
    }
    if (resQuery.validated?.reason) {
      selectedFilters.push(reasons.find(({ code }) => code === resQuery.validated?.reason)?.description ?? '')
    }
    if (resQuery.validated?.logistics) {
      selectedFilters.push(
        logisticsOptions.find(({ code }) => code === resQuery.validated?.logistics)?.description ?? '',
      )
    }

    res.render('bulk-edit-transfers/view', {
      showBreadcrumbs: true,
      prisons,
      reasons,
      logisticsOptions,
      hasValidationError: !resQuery.validated,
      results,
      start: resQuery.validated?.start ? formatInputDate(resQuery.validated.start) : resQuery.start,
      end: resQuery.validated?.end ? formatInputDate(resQuery.validated.end) : resQuery.end,
      destination: resQuery.destination,
      reason: resQuery.reason,
      logistics: resQuery.logistics,
      sort: resQuery?.sort ?? this.DEFAULT_SORT,
      selectedFilters: selectedFilters.join(', '),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    let searchResponse: components['schemas']['TransferSearchResponse'] | undefined
    let results: components['schemas']['Transfer'][] = []

    try {
      const requestBody: components['schemas']['ScheduledSearchRequest'] = {
        start: req.body.start,
        end: req.body.end,
        sort: req.body.sort ?? this.DEFAULT_SORT,
        page: 1,
        size: 1000,
        stage: 'SCHEDULED',
        statusCodes: ['SCHEDULED'],
      }

      if (req.body.destination) requestBody.destinationCodes = [req.body.destination]
      if (req.body.reason) requestBody.reasonCodes = [req.body.reason]
      if (req.body.logistics) requestBody.logisticsCodes = [req.body.logistics]

      searchResponse = await this.transferSchedulerService.searchTransfers({ res }, requestBody)
      results = searchResponse?.content ?? []
    } catch (error: unknown) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({ apiError: [getApiUserErrorMessage(error as HTTPError)] }),
      )
      return res.redirect('/bulk-edit-transfers')
    }

    if (!results.length) {
      req.flash(
        FLASH_KEY__VALIDATION_ERRORS,
        JSON.stringify({ apiError: 'No transfers found with the provided filters' }),
      )
      return res.redirect('/bulk-edit-transfers')
    }

    req.journeyData.bulkEditTransfer = {
      transfers: results.map(itm => {
        return {
          id: itm.id,
          prisoner: itm.person,
          startDate: formatInputDate(itm.schedule!.start)!,
          startTime: format(itm.schedule!.start, 'HH:mm'),
          destination: { code: itm.destination!.code, description: itm.destination!.name },
          reason: itm.reason!,
          logistics: itm.logistics!,
          comments: itm.schedule?.comments ?? null,
        }
      }),
    }

    return res.redirect('edit-list')
  }
}
