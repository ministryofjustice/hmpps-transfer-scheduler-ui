import { BaseRouter } from '../../../common/routes'
import { BulkScheduleTransfersDetailsController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BulkScheduleTransfersDetailsRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
  nonAssociationsService,
  populatePrisonerMiddleware,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new BulkScheduleTransfersDetailsController(
    transferSchedulerService,
    prisonRegisterService,
    nonAssociationsService,
  )

  get('/:prisonNumber', populatePrisonerMiddleware, controller.GET)
  post('/:prisonNumber', validate(schemaFactory(transferSchedulerService, prisonRegisterService)), controller.POST)

  return router
}
