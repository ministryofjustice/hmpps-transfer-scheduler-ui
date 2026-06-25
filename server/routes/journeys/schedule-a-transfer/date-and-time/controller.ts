import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class ScheduleTransferDateTimeController {
  GET = async (req: Request, res: Response) => {
    const { backUrl, startDate, startTime } = req.journeyData.scheduleTransfer!

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && startTime
        ? startTime.split(':')
        : []

    res.render('schedule-a-transfer/date-and-time/view', {
      backUrl,
      startDate: res.locals.formResponses?.['startDate'] ?? formatInputDate(startDate),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.startDate = req.body.startDate
    req.journeyData.scheduleTransfer!.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    res.redirect('destination')
  }
}
