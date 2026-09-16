import { NextFunction, Request, Response } from 'express'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferNonAssociationsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { nonAssociations, destination, transfer } = req.journeyData.updateTransfer!

    res.render('transfers/edit/non-associations/view', {
      goBackUrl: 'destination',
      transfer,
      destination,
      nonAssociations,
    })
  }

  POST = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transfer, destination } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyDestination',
        destinationCode: destination!.code ?? null,
      })

      req.journeyData.journeyCompleted = true
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        transfer.destination ? 'Transfer destination changed' : 'Transfer destination added',
      )
      res.redirect(req.journeyData.updateTransfer!.backUrl)
    } catch (e) {
      next(e)
    }
  }
}
