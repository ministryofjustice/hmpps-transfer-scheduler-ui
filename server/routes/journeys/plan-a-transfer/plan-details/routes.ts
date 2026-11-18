import { BaseRouter } from '../../../common/routes'
import { PlanTransferDetailsController } from './controller'
import { Services } from '../../../../services'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const PlanTransferDetailsRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
  nonAssociationsService,
}: Services) => {
  const { router, get, post } = BaseRouter()
  const controller = new PlanTransferDetailsController(
    transferSchedulerService,
    prisonRegisterService,
    nonAssociationsService,
  )

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService, prisonRegisterService)), controller.POST)

  return router
}
