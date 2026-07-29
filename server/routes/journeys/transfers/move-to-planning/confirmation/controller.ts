import { Request, Response } from 'express'

export class MoveTransferToPlanningConfirmationController {
  GET = async (req: Request, res: Response) => {
    res.render('transfers/move-to-planning/confirmation/view', {
      result: req.journeyData.moveTransferToPlanning!.result,
      historyQuery: req.journeyData.moveTransferToPlanning!.historyQuery,
    })
  }
}
