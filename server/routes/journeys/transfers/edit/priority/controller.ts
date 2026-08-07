import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferPriorityController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/priority/view', {
      transfer,
      backUrl,
      priority: res.locals.formResponses?.['priority'] ?? transfer.plan?.priority?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-priority'),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyPriority',
        priorityCode: req.body.priority.code,
      })

      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer plan priority changed')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
