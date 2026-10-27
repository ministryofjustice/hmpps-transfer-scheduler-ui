import { Request, Response } from 'express'

export class ScheduleTransferClashesController {
  GET = async (req: Request, res: Response) => {
    const { clashes } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/clashes/view', {
      clashes,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('destination')
  }
}
