import { Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

export class PlanTransferLogisticsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { logistics } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/logistics/view', {
      backUrl: 'destination',
      logistics: res.locals.formResponses?.['logistics'] ?? logistics?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.logistics) {
      req.journeyData.planTransfer!.logistics = req.body.logistics
    } else {
      delete req.journeyData.planTransfer!.logistics
    }

    res.redirect('comments')
  }
}
