import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferRequestDateController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, transfer } = req.journeyData.updateTransfer!

    res.render('transfers/edit/request-date/view', {
      backUrl,
      transfer,
      requestedOn: res.locals.formResponses?.['requestedOn'] ?? formatInputDate(transfer.plan?.requestedOn),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyRequestedOn',
        requestedOn: req.body.requestedOn,
      })

      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer request date changed')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
