import { Services } from '../../../../services'
import { BaseRouter } from '../../../common/routes'
import { BulkEditTransfersEditListController } from './controller'
import { validate } from '../../../../middleware/validation/validationMiddleware'
import { schemaFactory } from './schema'

export const BulkEditTransfersEditListRoutes = ({
  transferSchedulerService,
  prisonRegisterService,
  nonAssociationsService,
}: Services) => {
  const { router, get, post } = BaseRouter()

  const controller = new BulkEditTransfersEditListController(
    transferSchedulerService,
    prisonRegisterService,
    nonAssociationsService,
  )

  get('/', controller.GET)
  post('/', validate(schemaFactory(transferSchedulerService, prisonRegisterService)), controller.POST)

  return router
}
