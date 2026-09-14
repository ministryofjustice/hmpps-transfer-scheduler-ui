import { Request, Response } from 'express'

export class ScheduleTransferNonAssociationsController {
  GET = async (req: Request, res: Response) => {
    const { destination, nonAssociations } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/non-associations/view', {
      backUrl: 'destination',
      destination,
      nonAssociations,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('reason')
  }
}
