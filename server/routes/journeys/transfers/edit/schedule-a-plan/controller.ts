import { NextFunction, Request, Response } from 'express'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { SchemaType } from './schema'

export class SchedulePlanController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { backUrl, transfer } = req.journeyData.updateTransfer!

    res.render('transfers/edit/schedule-a-plan/view', { backUrl, transfer })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    const journey = req.journeyData.updateTransfer!

    if (!req.body.confirm) {
      res.redirect(`/transfers/${journey.transfer.id}`)
      return
    }

    try {
      journey.result = await this.transferSchedulerService.updateTransfer({ res }, journey.transfer.id, {
        type: 'ScheduleTransfer',
        start: journey.transfer.schedule.start,
      })
      req.journeyData.journeyCompleted = true
      journey.updatedTransfer = await this.transferSchedulerService.getTransfer({ res }, journey.transfer.id)
      res.redirect(journey.result!.content.length ? 'confirmation' : `/transfers/${journey.transfer.id}`)
    } catch (error) {
      const statusCode = (error as { data?: { status?: number } })?.data?.status

      if (statusCode === 409) {
        next({ text: JSON.stringify({ userMessage: 'This transfer can no longer be cancelled' }) })
      } else {
        next(error)
      }
    }
  }
}
