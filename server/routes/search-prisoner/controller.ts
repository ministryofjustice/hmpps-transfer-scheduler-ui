import { Request, Response } from 'express'
import type { HTTPError } from 'superagent'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'
import { ResQuerySchemaType } from './schema'
import { prisonerProfileBacklink } from '../../utils/utils'
import Prisoner from '../../services/apis/model/prisoner'
import { processApiError } from '../../middleware/validation/handleApiError'
import { getValidationErrors } from '../../middleware/validation/populateValidationErrors'
import config from '../../config'

export class SearchPrisonerController {
  constructor(
    readonly prisonerSearchApiService: PrisonerSearchApiService,
    readonly configs: {
      caption: string
      action: { label: string; url: string }
    },
  ) {}

  GET = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    let searchResponse: Prisoner[] = []

    try {
      if (resQuery?.validated?.searchTerm) {
        searchResponse = await this.prisonerSearchApiService.searchPrisoner({ res }, resQuery.validated.searchTerm)
      }
    } catch (e) {
      processApiError(e as HTTPError, req, false)
    }

    res.render('search-prisoner/view', {
      caption: this.configs.caption,
      action: this.configs.action,
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      results: searchResponse.length
        ? searchResponse.map(prisoner => ({
            ...prisoner,
            backLink: prisonerProfileBacklink(req.originalUrl, prisoner.prisonerNumber),
          }))
        : [],
      validationErrors: res.locals['validationErrors'] ?? getValidationErrors(req),
    })
  }

  GET_GENERATE_CHECKLIST = async (req: Request, res: Response) => {
    const resQuery = res.locals['query'] as ResQuerySchemaType

    let searchResponse: Prisoner[] = []

    try {
      if (resQuery?.validated?.searchTerm) {
        searchResponse = await this.prisonerSearchApiService.searchPrisoner({ res }, resQuery.validated.searchTerm)
      }
    } catch (e) {
      processApiError(e as HTTPError, req, false)
    }

    res.render('search-prisoner/view', {
      caption: this.configs.caption,
      action: {
        ...this.configs.action,
        url: `${config.serviceUrls.documentGeneration}/download-document/${req.middleware?.documentTemplateId}?${new URLSearchParams(
          {
            prisonId: res.locals.user.getActiveCaseloadId()!,
            returnTo: config.ingressUrl,
            backTo: config.ingressUrl + req.originalUrl,
          },
        ).toString()}&prisonNumber=`,
      },
      showBreadcrumbs: true,
      searchTerm: resQuery?.searchTerm,
      results: searchResponse.length
        ? searchResponse.map(prisoner => ({
            ...prisoner,
            backLink: prisonerProfileBacklink(req.originalUrl, prisoner.prisonerNumber),
          }))
        : [],
      validationErrors: res.locals['validationErrors'] ?? getValidationErrors(req),
    })
  }
}
