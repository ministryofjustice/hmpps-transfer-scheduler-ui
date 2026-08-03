import { Services } from '../../services'
import { BaseRouter } from '../common/routes'
import { SearchPrisonerController } from './controller'
import { validateOnGET } from '../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Page } from '../../services/auditService'
import { requirePermissions } from '../../middleware/permissions/requirePermissions'
import { UserPermissionLevel } from '../../interfaces/hmppsUser'

export const SearchPrisonerRoutes = ({ prisonerSearchService, populateDocumentTemplateMiddleware }: Services) => {
  const { router, get } = BaseRouter()

  get(
    '/schedule-a-transfer',
    Page.SEARCH_PRISONER,
    requirePermissions(UserPermissionLevel.MANAGE),
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'Schedule a transfer',
      action: {
        label: 'Schedule a transfer',
        url: '/schedule-a-transfer/start/',
      },
    }).GET,
  )

  get(
    '/plan-a-transfer',
    Page.SEARCH_PRISONER,
    requirePermissions(UserPermissionLevel.MANAGE),
    validateOnGET(schema, 'searchTerm'),
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'Plan a transfer',
      action: {
        label: 'Plan a transfer',
        url: '/plan-a-transfer/start/',
      },
    }).GET,
  )

  get(
    '/generate-transfer-checklist',
    Page.SEARCH_PRISONER,
    validateOnGET(schema, 'searchTerm'),
    populateDocumentTemplateMiddleware,
    new SearchPrisonerController(prisonerSearchService, {
      caption: 'Create and download documents',
      action: {
        label: 'Create a transfer checklist',
        url: '',
      },
    }).GET_GENERATE_CHECKLIST,
  )

  return router
}
