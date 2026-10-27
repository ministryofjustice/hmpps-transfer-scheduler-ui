import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import CheckClashesService from '../../../../services/checkClashesService'

export class ScheduleTransferDateTimeController {
  constructor(private readonly checkClashesService: CheckClashesService) {}

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
    const journey = req.journeyData.scheduleTransfer!
    journey.startDate = req.body.startDate
    journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    journey.clashes = await this.checkClashesService.getClashes(
      { res },
      req.journeyData.prisonerDetails!.prisonerNumber,
      `${journey.startDate}T00:00:00`,
      `${journey.startDate}T23:59:59`,
    )

    res.redirect(journey.clashes?.length ? 'clashes' : 'destination')
  }
}
