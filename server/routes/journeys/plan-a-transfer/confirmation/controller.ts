import { Request, Response } from 'express'

export class PlanTransferConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    res.render('plan-a-transfer/confirmation/view', {
      result: req.journeyData.planTransfer!.result,
      historyQuery: req.journeyData.planTransfer!.historyQuery,
    })
  }
}
