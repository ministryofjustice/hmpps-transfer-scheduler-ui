import { Request, Response } from 'express'

export class BulkEditTransfersConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { startDate, startTime, destination, result } = req.journeyData.bulkEditTransfer!

    res.render('bulk-edit-transfers/confirmation/view', {
      startDate,
      startTime,
      destination,
      result,
    })
  }
}
