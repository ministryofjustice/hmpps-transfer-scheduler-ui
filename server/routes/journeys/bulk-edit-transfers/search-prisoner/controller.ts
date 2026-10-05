import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import PrisonerSearchApiService from '../../../../services/apis/prisonerSearchService'
import { prisonerProfileBacklink } from '../../../../utils/utils'
import Prisoner from '../../../../services/apis/model/prisoner'
import { getValidationErrors } from '../../../../middleware/validation/populateValidationErrors'
import { processApiError } from '../../../../middleware/validation/handleApiError'
import { SchemaType } from './schema'

export class BulkEditTransfersSearchPrisonerController {
  constructor(readonly prisonerSearchApiService: PrisonerSearchApiService) {}

  GET = async (req: Request, res: Response) => {
    const { searchTerm } = req.journeyData.bulkEditTransfer!

    let searchResponse: Prisoner[] = []

    try {
      if (searchTerm) {
        searchResponse = await this.prisonerSearchApiService.searchPrisoner({ res }, searchTerm)
      }
    } catch (e) {
      processApiError(e as HTTPError, req, false)
    }

    res.render('bulk-edit-transfers/search-prisoner/view', {
      backUrl: 'edit-list',
      searchTerm,
      results: searchResponse.length
        ? searchResponse.map(prisoner => ({
            ...prisoner,
            backLink: prisonerProfileBacklink(req.originalUrl, prisoner.prisonerNumber),
          }))
        : [],
      validationErrors: res.locals['validationErrors'] ?? getValidationErrors(req),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.bulkEditTransfer!.searchTerm = req.body.searchTerm ?? ''
    res.redirect('search-prisoner')
  }

  selectPrisoner = async (req: Request, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

    const { prisonerNumber, firstName, lastName } = req.middleware!.prisonerData!

    journey.prisonerToAdd = {
      identifier: prisonerNumber,
      firstName,
      lastName,
    }
    res.redirect(`../transfer-details/${prisonerNumber}`)
  }
}
