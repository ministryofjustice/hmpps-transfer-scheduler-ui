import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersSearchPrisonerController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../services'

export const BulkEditTransfersSearchPrisonersRoutes = ({
  prisonerSearchService,
  populatePrisonerMiddleware,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkEditTransfersSearchPrisonerController(prisonerSearchService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)
  get('/:prisonNumber', populatePrisonerMiddleware, controller.selectPrisoner)

  return router
}
