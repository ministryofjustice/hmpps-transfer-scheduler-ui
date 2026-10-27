import { Request, Response } from 'express'

export class EditTransferClashesController {
  GET = async (req: Request, res: Response) => {
    const { clashes, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/clashes/view', {
      goBackUrl: backUrl,
      clashes,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('schedule-a-plan')
  }
}
