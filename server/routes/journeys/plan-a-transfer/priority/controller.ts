import { Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

export class PlanTransferPriorityController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { priority } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/priority/view', {
      backUrl: 'reason',
      priority: res.locals.formResponses?.['priority'] ?? priority?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-priority'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.planTransfer!.priority = req.body.priority
    res.redirect('date-and-time')
  }
}
