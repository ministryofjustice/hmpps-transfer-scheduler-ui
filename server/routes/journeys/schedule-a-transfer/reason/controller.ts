import { Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

export class ScheduleTransferReasonController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { reason } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/reason/view', {
      backUrl: 'destination',
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.reason = req.body.reason
    res.redirect('logistics')
  }
}
