import { Request, Response } from 'express'

export class ScheduleTransferNonAssociationsController {
  GET = async (req: Request, res: Response) => {
    const { nonAssociations, destinationWithNonAssociation } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/non-associations/view', {
      goBackUrl: 'destination',
      destination: destinationWithNonAssociation,
      nonAssociations,
    })
  }

  POST = async (req: Request, res: Response) => {
    if (req.journeyData.scheduleTransfer!.destinationWithNonAssociation) {
      req.journeyData.scheduleTransfer!.destination = req.journeyData.scheduleTransfer!.destinationWithNonAssociation
      delete req.journeyData.scheduleTransfer!.destinationWithNonAssociation
    }
    res.redirect('reason')
  }
}
