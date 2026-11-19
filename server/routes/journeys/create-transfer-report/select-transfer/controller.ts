import { Request, Response } from 'express'
import { HTTPError } from 'superagent'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { components } from '../../../../@types/transferSchedulerApi'
import { setPaginationLocals } from '../../../../views/partials/simplePagination/utils'
import { getApiUserErrorMessage } from '../../../../utils/utils'

export class CreateTransferReportSelectTransferController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  private PAGE_SIZE = 25

  GET = async (req: Request<unknown, unknown, unknown, { page?: string }>, res: Response) => {
    const page = req.query.page?.match(/^\d+$/) ? Number(req.query.page) : 1
    let results: components['schemas']['Transfer'][] = []

    try {
      const searchResponse = await this.transferSchedulerService.searchTransfersByPerson(
        { res },
        req.journeyData!.prisonerDetails!.prisonerNumber,
        {
          sort: 'start,desc',
          page,
          size: this.PAGE_SIZE,
        },
      )

      results = searchResponse.content

      setPaginationLocals(
        res,
        this.PAGE_SIZE,
        page,
        searchResponse?.metadata?.totalElements ?? 0,
        searchResponse.content.length,
      )
    } catch (error: unknown) {
      res.locals['validationErrors'] = { apiError: [getApiUserErrorMessage(error as HTTPError)] }
    }

    res.render('create-transfer-report/select-transfer/view', {
      showBreadcrumbs: true,
      results,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('destination')
  }
}
