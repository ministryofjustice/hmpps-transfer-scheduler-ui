import { NextFunction, Request, Response } from 'express'
import { SchemaType } from '../../../schedule-a-transfer/reason/schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferReasonController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/reason/view', {
      transfer,
      backUrl,
      reason: res.locals.formResponses?.['reason'] ?? transfer.reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyReason',
        reasonCode: req.body.reason.code,
      })

      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer reason changed')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
