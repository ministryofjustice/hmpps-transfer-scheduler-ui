import { Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

export class ScheduleTransferLogisticsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { logistics } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/logistics/view', {
      backUrl: 'reason',
      logistics: res.locals.formResponses?.['logistics'] ?? logistics?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.logistics = req.body.logistics
    res.redirect('comments')
  }
}
