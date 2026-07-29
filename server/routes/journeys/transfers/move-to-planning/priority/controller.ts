import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'

export class MoveTransferToPlanningPriorityController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { priority } = req.journeyData.moveTransferToPlanning!

    res.render('transfers/move-to-planning/priority/view', {
      backUrl: 'request-date',
      priority: res.locals.formResponses?.['priority'] ?? priority?.code,
      options: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-priority'),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.moveTransferToPlanning!

      await this.transferSchedulerService.updateTransfer({ res }, journey.transfer.id, {
        type: 'PlanTransfer',
        requestedOn: journey.requestedOn!,
        priorityCode: req.body.priority.code,
      })

      journey.result = await this.transferSchedulerService.getTransfer({ res }, journey.transfer.id)

      req.journeyData.journeyCompleted = true
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (_req: Request, res: Response) => {
    res.redirect('confirmation')
  }
}
