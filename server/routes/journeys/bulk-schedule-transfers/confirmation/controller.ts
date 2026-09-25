import { Request, Response } from 'express'

export class BulkScheduleTransfersConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    res.render('bulk-schedule-transfers/confirmation/view', {
      result: req.journeyData.bulkScheduleTransfer!.result,
    })
  }
}
