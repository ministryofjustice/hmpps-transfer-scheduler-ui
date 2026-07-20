import { Request, Response } from 'express'
import { SchemaType } from '../../schedule-a-transfer/reason/schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

export class PlanTransferReasonController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { reason } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/reason/view', {
      backUrl: 'request-date',
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.planTransfer!.reason = req.body.reason
    res.redirect('priority')
  }
}
