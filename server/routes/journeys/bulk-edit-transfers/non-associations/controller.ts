import { Request, Response } from 'express'

export class BulkEditTransfersNonAssociationsController {
  GET = async (req: Request, res: Response) => {
    const { nonAssociations } = req.journeyData.bulkEditTransfer!

    res.render('bulk-schedule-transfers/non-associations/view', {
      backUrl: 'edit-list',
      goBackUrl: 'edit-list',
      nonAssociations,
    })
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('check-answers')
  }
}
