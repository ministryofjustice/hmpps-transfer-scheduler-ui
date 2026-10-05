import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersDetailsController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BulkEditTransfersDetailsRoutes = ({ transferSchedulerService, populatePrisonerMiddleware }: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkEditTransfersDetailsController(transferSchedulerService)

  get('/:prisonNumber', populatePrisonerMiddleware, controller.GET)
  post('/:prisonNumber', validate(schemaFactory(transferSchedulerService)), controller.POST)

  return router
}
