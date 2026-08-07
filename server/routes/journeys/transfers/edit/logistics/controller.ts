import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferLogisticsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/logistics/view', {
      transfer,
      backUrl,
      logistics: res.locals.formResponses?.['logistics'] ?? transfer.logistics?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyLogistics',
        logisticsCode: req.body.logistics.code,
      })

      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer escort details changed')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
