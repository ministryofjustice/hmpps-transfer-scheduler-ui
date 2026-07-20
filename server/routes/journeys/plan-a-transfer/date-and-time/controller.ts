import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class PlanTransferDateTimeController {
  GET = async (req: Request, res: Response) => {
    const { startDate, startTime } = req.journeyData.planTransfer!

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && startTime
        ? startTime.split(':')
        : []

    res.render('plan-a-transfer/date-and-time/view', {
      backUrl: 'priority',
      startDate: res.locals.formResponses?.['startDate'] ?? formatInputDate(startDate),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const { startDate, startTimeHour, startTimeMinute } = req.body
    if (startDate && startTimeHour && startTimeMinute) {
      req.journeyData.planTransfer!.startDate = req.body.startDate
      req.journeyData.planTransfer!.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    } else {
      delete req.journeyData.planTransfer!.startDate
      delete req.journeyData.planTransfer!.startTime
    }

    res.redirect('destination')
  }
}
