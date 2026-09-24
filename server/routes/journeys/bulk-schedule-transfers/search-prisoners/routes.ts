import { BaseRouter } from '../../../common/routes'
import { BulkScheduleTransfersSearchPrisonersController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schema } from './schema'
import { Services } from '../../../../services'

export const BulkScheduleTransfersSearchPrisonersRoutes = ({
  prisonerSearchService,
  populatePrisonerMiddleware,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkScheduleTransfersSearchPrisonersController(prisonerSearchService)

  get('/', controller.GET)
  post('/', validate(schema), controller.POST)

  get('/:prisonNumber', populatePrisonerMiddleware, controller.selectPrisoner)
  get('/:prisonNumber/remove', controller.removePrisoner)
  post('/continue', controller.continue)

  return router
}
