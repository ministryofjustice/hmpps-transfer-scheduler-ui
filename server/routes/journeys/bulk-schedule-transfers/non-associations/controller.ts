import { Request, Response } from 'express'

export class BulkScheduleTransfersNonAssociationsController {
  GET = async (req: Request, res: Response) => {
    const { nonAssociations } = req.journeyData.bulkScheduleTransfer!

    res.render('bulk-schedule-transfers/non-associations/view', {
      backUrl: `transfer-details/${nonAssociations![0]!.prisoner.prisonerNumber}`,
      goBackUrl: 'search-prisoners',
      nonAssociations,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('check-answers')
  }
}
