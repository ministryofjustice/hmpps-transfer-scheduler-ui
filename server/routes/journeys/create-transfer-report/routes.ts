import { Request } from 'express'
import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import { toPrisonerDetails } from '../../../middleware/populatePrisonerDetails'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import { CreateTransferReportSelectTransferRoutes } from './select-transfer/routes'
import { CreateTransferReportDestinationRoutes } from './destination/routes'
import { CreateTransferReportShareLinkRoutes } from './report/routes'

export const CreateTransferReportRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  const START_ENTRY_PAGES: string[] = [Page.SEARCH_PRISONER]

  get('/start/:prisonNumber', services.populatePrisonerMiddleware, (req, res) => {
    if (req.middleware?.prisonerData) {
      req.journeyData.prisonerDetails = toPrisonerDetails(req.middleware.prisonerData)

      const lastLandmark = res.locals.breadcrumbs.last()
      req.journeyData.createTransferReport = {
        backUrl:
          lastLandmark && START_ENTRY_PAGES.includes(lastLandmark.alias || '')
            ? lastLandmark.href
            : `${res.locals.prisonerProfileUrl}/prisoner/${req.journeyData.prisonerDetails.prisonerNumber}`,
        historyQuery: encodeURIComponent(String(req.query['history'])),
      }
      res.redirect('../select-transfer')
    } else {
      res.notFound()
    }
  })

  get(
    '*any',
    Page.CREATE_TRANSFER_REPORT,
    (req, res, next) => {
      if (req.journeyData.prisonerDetails) {
        res.setAuditDetails.prisonNumber(req.journeyData.prisonerDetails.prisonerNumber)
      }
      next()
    },
    journeyStateGuard({
      report: (req: Request) => (req.journeyData.createTransferReport!.destination ? undefined : '/destination'),
    }),
  )

  router.use('/select-transfer', CreateTransferReportSelectTransferRoutes(services))
  router.use('/destination', CreateTransferReportDestinationRoutes(services))
  router.use('/report', CreateTransferReportShareLinkRoutes(services))

  return router
}
