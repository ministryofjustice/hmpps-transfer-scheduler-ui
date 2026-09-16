import { Request, Response } from 'express'

export class PlanTransferNonAssociationsController {
  GET = async (req: Request, res: Response) => {
    const { nonAssociations, destinationWithNonAssociation } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/non-associations/view', {
      goBackUrl: 'destination',
      destination: destinationWithNonAssociation,
      nonAssociations,
    })
  }

  POST = async (req: Request, res: Response) => {
    if (req.journeyData.planTransfer!.destinationWithNonAssociation) {
      req.journeyData.planTransfer!.destination = req.journeyData.planTransfer!.destinationWithNonAssociation
      delete req.journeyData.planTransfer!.destinationWithNonAssociation
    }
    res.redirect('logistics')
  }
}
