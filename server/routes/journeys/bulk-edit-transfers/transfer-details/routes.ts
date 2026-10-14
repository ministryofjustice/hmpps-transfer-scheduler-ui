import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersDetailsController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from '../../bulk-schedule-transfers/transfer-details/schema'

export const BulkEditTransfersDetailsRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
  populatePrisonerMiddleware,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkEditTransfersDetailsController(transferSchedulerService, prisonRegisterService)

  get('/:prisonNumber', populatePrisonerMiddleware, controller.GET)
  post('/:prisonNumber', validate(schemaFactory(transferSchedulerService, prisonRegisterService)), controller.POST)

  return router
}
