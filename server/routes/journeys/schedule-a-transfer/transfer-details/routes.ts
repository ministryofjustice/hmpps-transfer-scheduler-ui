import { BaseRouter } from '../../../common/routes'
import { ScheduleTransferDetailsController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const ScheduleTransferDetailsRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
  nonAssociationsService,
  checkClashesService,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new ScheduleTransferDetailsController(
    transferSchedulerService,
    prisonRegisterService,
    nonAssociationsService,
    checkClashesService,
  )

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService, prisonRegisterService)), controller.POST)

  return router
}
