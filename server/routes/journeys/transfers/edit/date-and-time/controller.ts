import { NextFunction, Request, Response } from 'express'
import { format } from 'date-fns'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferDateTimeController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    const startDate =
      res.locals.formResponses?.['startDate'] ??
      (transfer.schedule?.start && format(transfer.schedule.start, 'd/M/yyyy'))
    const startTimeHour =
      res.locals.formResponses?.['startTimeHour'] ?? (transfer.schedule?.start && format(transfer.schedule.start, 'HH'))
    const startTimeMinute =
      res.locals.formResponses?.['startTimeMinute'] ??
      (transfer.schedule?.start && format(transfer.schedule.start, 'mm'))

    res.render('transfers/edit/date-and-time/view', {
      backUrl,
      transfer,
      startDate,
      startTimeHour,
      startTimeMinute,
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyScheduleStart',
        start: `${req.body.startDate}T${req.body.startTimeHour}:${req.body.startTimeMinute}:00`,
      })

      req.journeyData.journeyCompleted = true
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        transfer.schedule?.start ? 'Transfer date and time changed' : 'Transfer date and time added',
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
