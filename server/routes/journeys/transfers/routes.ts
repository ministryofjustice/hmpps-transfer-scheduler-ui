import { Request, Response } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { createBackUrlFor } from '../../../middleware/history/historyMiddleware'
import { toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import { isTransferEditable } from '../../../utils/utils'
import { EditTransferRoutes } from './edit/routes'

export const UpdateTransferRoutes = (services: Services) => {
  const { router, get } = BaseRouter()
  const { populateTransferMiddleware } = services

  get(
    '/start-edit/:id/:property',
    populateTransferMiddleware({ withHistory: false }),
    async (req: Request<{ id: string; property: string }>, res: Response) => {
      if (!isTransferEditable(req.middleware!.transfer!)) {
        res.conflict()
        return
      }

      req.journeyData.updateTransfer = {
        transfer: req.middleware!.transfer!,
        backUrl: createBackUrlFor(
          res,
          /transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
          `/transfers/${req.params.id}`,
        ),
        historyQuery: encodeURIComponent(String(req.query['history'])),
      }
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware!.prisonerData!)
      res.redirect(`../../edit/${req.params.property}`)
    },
  )

  router.use('/edit', EditTransferRoutes(services))

  return router
}
