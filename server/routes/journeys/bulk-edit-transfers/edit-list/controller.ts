import { Request, Response } from 'express'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'

export class BulkEditTransfersEditListController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  GET = async (req: Request, res: Response) => {
    const { transfers, startDate, startTime, destination, selectedTransfers } = req.journeyData.bulkEditTransfer!

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && startTime
        ? startTime.split(':')
        : []

    res.render('bulk-edit-transfers/edit-list/view', {
      backUrl: req.journeyData.isCheckAnswers ? 'check-answers' : '/bulk-edit-transfers',
      transfers,
      prisons:
        (await this.prisonRegisterService.getPrisons({ res }))?.filter(
          ({ code }) => code !== res.locals.user.getActiveCaseloadId(),
        ) ?? [],
      startDate: res.locals.formResponses?.['startDate'] ?? (startDate ? formatInputDate(startDate) : null),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      selectedTransfers: res.locals.formResponses?.['selectedTransfers'] ?? selectedTransfers,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

    journey.startDate = req.body.startDate
    journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    journey.destination = req.body.destination
    journey.selectedTransfers = req.body.selectedTransfers!

    if (req.body.add !== undefined) {
      res.redirect('search-prisoner')
    } else {
      res.redirect('check-answers')
    }
  }
}
