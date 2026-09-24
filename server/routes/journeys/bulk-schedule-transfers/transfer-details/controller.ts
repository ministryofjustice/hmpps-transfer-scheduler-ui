import { Request, Response } from 'express'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'

export class BulkScheduleTransfersDetailsController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { transfers, lastEnteredTransfer } = req.journeyData.bulkScheduleTransfer!

    const transfer = transfers!.find(
      ({ prisoner }) => prisoner.prisonerNumber === req.middleware!.prisonerData!.prisonerNumber,
    )

    if (!transfers) {
      return res.notFound()
    }

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    const preFillValues = transfer?.startDate ? transfer : lastEnteredTransfer

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] &&
      !res.locals.formResponses?.['startTimeMinute'] &&
      preFillValues?.startTime
        ? preFillValues.startTime.split(':')
        : []

    return res.render('bulk-schedule-transfers/transfer-details/view', {
      backUrl: req.journeyData.isCheckAnswers ? '../check-answers' : '../search-prisoners',
      startDate:
        res.locals.formResponses?.['startDate'] ??
        (preFillValues?.startDate ? formatInputDate(preFillValues.startDate) : null),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
      destination: res.locals.formResponses?.['destination'] ?? preFillValues?.destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
      reason: res.locals.formResponses?.['reason'] ?? preFillValues?.reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logistics: res.locals.formResponses?.['logistics'] ?? preFillValues?.logistics?.code,
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      comments: res.locals.formResponses?.['comments'] ?? preFillValues?.comments,
      transfers,
      prisoner: req.middleware?.prisonerData,
      prisonerDetails: null, // suppress miniProfile from layout.njk
    })
  }

  POST = async (req: Request<{ prisonNumber: string }, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkScheduleTransfer!

    const transfer = journey.transfers!.find(({ prisoner }) => prisoner.prisonerNumber === req.params.prisonNumber)!

    journey.lastEnteredTransfer = {
      startDate: req.body.startDate,
      startTime: `${req.body.startTimeHour}:${req.body.startTimeMinute}`,
      destination: req.body.destination,
      reason: req.body.reason,
      logistics: req.body.logistics,
      comments: req.body.comments,
    }

    transfer.startDate = journey.lastEnteredTransfer.startDate!
    transfer.startTime = journey.lastEnteredTransfer.startTime!
    transfer.destination = journey.lastEnteredTransfer.destination!
    transfer.reason = journey.lastEnteredTransfer.reason!
    transfer.logistics = journey.lastEnteredTransfer.logistics!
    transfer.comments = journey.lastEnteredTransfer.comments ?? null

    const nextTransfer = journey.transfers!.find(({ startDate }) => !startDate)

    if (nextTransfer) {
      res.redirect(nextTransfer.prisoner.prisonerNumber)
    } else {
      res.redirect('../check-answers')
    }
  }
}
