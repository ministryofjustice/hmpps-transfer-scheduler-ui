import { Request, Response } from 'express'

export class EditTransferConfirmationController {
  GET = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true

    const { transfer, historyQuery, result, updatedTransfer } = req.journeyData.updateTransfer!

    res.render('transfers/edit/confirmation/view', {
      domainEvent: result!.content[0]!.domainEvents[0],
      transfer,
      historyQuery,
      result: updatedTransfer,
    })
  }
}
