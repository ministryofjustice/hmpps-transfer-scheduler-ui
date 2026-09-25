import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import PrisonerSearchApiService from '../../../../services/apis/prisonerSearchService'
import { prisonerProfileBacklink } from '../../../../utils/utils'
import Prisoner from '../../../../services/apis/model/prisoner'
import { getValidationErrors } from '../../../../middleware/validation/populateValidationErrors'
import { processApiError } from '../../../../middleware/validation/handleApiError'
import { SchemaType } from './schema'
import { toPrisonerDetails } from '../../../../middleware/populatePrisonerDetails'

export class BulkScheduleTransfersSearchPrisonersController {
  constructor(readonly prisonerSearchApiService: PrisonerSearchApiService) {}

  GET = async (req: Request, res: Response) => {
    const { searchTerm, transfers } = req.journeyData.bulkScheduleTransfer!

    let searchResponse: Prisoner[] = []

    try {
      if (searchTerm) {
        searchResponse = await this.prisonerSearchApiService.searchPrisoner({ res }, searchTerm)
      }
    } catch (e) {
      processApiError(e as HTTPError, req, false)
    }

    res.render('bulk-schedule-transfers/search-prisoners/view', {
      showBreadcrumbs: true,
      searchTerm,
      results: searchResponse.length
        ? searchResponse.map(prisoner => ({
            ...prisoner,
            backLink: prisonerProfileBacklink(req.originalUrl, prisoner.prisonerNumber),
          }))
        : [],
      validationErrors: res.locals['validationErrors'] ?? getValidationErrors(req),
      transfers,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.bulkScheduleTransfer!.searchTerm = req.body.searchTerm ?? ''
    res.redirect('search-prisoners')
  }

  selectPrisoner = async (req: Request, res: Response) => {
    const journey = req.journeyData.bulkScheduleTransfer!

    journey.transfers ??= []
    if (
      req.middleware?.prisonerData &&
      !journey.transfers.find(
        transfer => transfer.prisoner.prisonerNumber === req.middleware!.prisonerData.prisonerNumber,
      )
    ) {
      journey.transfers.push({
        prisoner: toPrisonerDetails(req.middleware.prisonerData),
      })
    }
    res.redirect('../search-prisoners')
  }

  removePrisoner = async (req: Request<{ prisonNumber: string }>, res: Response) => {
    const journey = req.journeyData.bulkScheduleTransfer!
    const { prisonNumber } = req.params

    journey.transfers ??= []
    journey.transfers = journey.transfers.filter(transfer => transfer.prisoner.prisonerNumber !== prisonNumber)

    res.redirect('../../search-prisoners')
  }

  continue = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const transferToEnter = req.journeyData.bulkScheduleTransfer!.transfers!.find(transfer => !transfer.startDate)
    if (!transferToEnter) {
      res.redirect('../check-answers')
    } else {
      delete req.journeyData.isCheckAnswers
      res.redirect(`../transfer-details/${transferToEnter.prisoner.prisonerNumber}`)
    }
  }
}
