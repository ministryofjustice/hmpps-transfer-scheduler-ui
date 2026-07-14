import { RequestHandler } from 'express'
import TransferSchedulerService from '../../services/apis/transferSchedulerService'
import PrisonerSearchApiService from '../../services/apis/prisonerSearchService'

export const populateTransfer =
  (transferSchedulerService: TransferSchedulerService, prisonerSearchApiService: PrisonerSearchApiService) =>
  ({ withHistory }: { withHistory: boolean }): RequestHandler<{ id: string }> => {
    return async (req, res, next) => {
      if (!req.method.match(/GET/i)) {
        return next()
      }

      const [transfer, transferHistory] = await Promise.all([
        transferSchedulerService.getTransfer({ res }, req.params.id),
        withHistory ? transferSchedulerService.getTransferAuditHistory({ res }, req.params.id) : null,
      ])
      if (!transfer) {
        return res.notFound()
      }

      if (!res.locals.user.caseLoads?.find(caseLoad => caseLoad.caseLoadId === transfer.prison.code)) {
        return res.notAuthorised()
      }

      req.middleware ??= {}
      req.middleware.transfer = transfer
      if (transferHistory) req.middleware.transferHistory = transferHistory
      req.middleware.prisonerData = await prisonerSearchApiService.getPrisonerDetails(
        { res },
        transfer.person.identifier,
      )
      res.locals.prisonerDetails = req.middleware.prisonerData

      return next()
    }
  }
