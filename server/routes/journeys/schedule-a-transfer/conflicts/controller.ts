import { Request, Response } from 'express'

export class ScheduleTransferConflictsController {
  GET = async (req: Request, res: Response) => {
    const { clashes, nonAssociations, destinationWithNonAssociation } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/conflicts/view', {
      goBackUrl: 'transfer-details',
      clashes,
      destination: destinationWithNonAssociation,
      nonAssociations,
    })
  }

  POST = async (req: Request, res: Response) => {
    const journey = req.journeyData.scheduleTransfer!

    if (journey.destinationWithNonAssociation) {
      journey.destination = journey.destinationWithNonAssociation
      delete journey.destinationWithNonAssociation
    }
    if (journey.startDateWithClash) {
      journey.startDate = journey.startDateWithClash
      delete journey.startDateWithClash
    }
    if (journey.startTimeWithClash) {
      journey.startTime = journey.startTimeWithClash
      delete journey.startTimeWithClash
    }

    res.redirect('check-answers')
  }
}
