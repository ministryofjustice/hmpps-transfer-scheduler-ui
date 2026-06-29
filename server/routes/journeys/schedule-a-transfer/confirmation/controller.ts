import { Request, Response } from 'express'

export class ScheduleTransferConfirmationController0 {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    res.render('schedule-a-transfer/confirmation/view', {
      result: req.journeyData.scheduleTransfer!.result,
      historyQuery: req.journeyData.scheduleTransfer!.historyQuery,
    })
  }
}
