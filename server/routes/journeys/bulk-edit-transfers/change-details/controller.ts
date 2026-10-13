import { Request, Response } from 'express'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { SchemaType } from './schema'

export class BulkEditTransfersChangeDetailsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfers } = req.journeyData.bulkEditTransfer!

    const transfer = transfers!.find(
      ({ prisoner }) => prisoner.identifier === req.middleware!.prisonerData!.prisonerNumber,
    )

    if (!transfer) {
      return res.notFound()
    }

    return res.render('bulk-edit-transfers/change-details/view', {
      backUrl: '../check-answers',
      reason: res.locals.formResponses?.['reason'] ?? transfer?.reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      comments: res.locals.formResponses?.['comments'] ?? transfer?.comments,
      prisoner: transfer.prisoner,
    })
  }

  POST = async (req: Request<{ prisonNumber: string }, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

    const transfer = journey.transfers!.find(({ prisoner }) => prisoner.identifier === req.params.prisonNumber)

    if (transfer) {
      transfer.reason = req.body.reason!
      transfer.comments = req.body.comments ?? null
    } else {
      return res.notFound()
    }

    return res.redirect('../check-answers')
  }
}
