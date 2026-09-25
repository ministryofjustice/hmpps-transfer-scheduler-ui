import { Services } from '../../../services'
import { BaseRouter } from '../../common/routes'
import { Page } from '../../../services/auditService'
import preventNavigationToExpiredJourneys from '../../../middleware/journey/preventNavigationToExpiredJourneys'
import journeyStateGuard from '../../../middleware/journey/journeyStateGuard'
import { BulkScheduleTransfersSearchPrisonersRoutes } from './search-prisoners/routes'
import { BulkScheduleTransfersDetailsRoutes } from './transfer-details/routes'
import { BulkScheduleTransfersCheckAnswersRoutes } from './check-answers/routes'
import { BulkScheduleTransfersConfirmationRoutes } from './confirmation/routes'

export const BulkScheduleTransfersRoutes = (services: Services) => {
  const { router, get } = BaseRouter()

  get('/', (req, res) => {
    req.journeyData.bulkScheduleTransfer ??= {}
    res.redirect('bulk-schedule-transfers/search-prisoners')
  })

  get(
    '*any',
    Page.BULK_SCHEDULE_TRANSFERS,
    (req, res, next) => {
      if (req.journeyData.bulkScheduleTransfer?.searchTerm) {
        res.setAuditDetails.searchTerm(req.journeyData.bulkScheduleTransfer.searchTerm)
      }
      next()
    },
    preventNavigationToExpiredJourneys(),
    journeyStateGuard({}),
  )

  router.use('/search-prisoners', BulkScheduleTransfersSearchPrisonersRoutes(services))
  router.use('/transfer-details', BulkScheduleTransfersDetailsRoutes(services))
  router.use('/check-answers', BulkScheduleTransfersCheckAnswersRoutes(services))
  router.use('/confirmation', BulkScheduleTransfersConfirmationRoutes())

  return router
}
