import { Request, Response } from 'express'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'
import NonAssociationsService from '../../../../services/apis/nonAssociationsService'
import CheckClashesService from '../../../../services/checkClashesService'

export class ScheduleTransferDetailsController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly nonAssociationsService: NonAssociationsService,
    private readonly checkClashesService: CheckClashesService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const {
      backUrl,
      startDate,
      startDateWithClash,
      startTime,
      startTimeWithClash,
      destination,
      destinationWithNonAssociation,
      reason,
      logistics,
      comments,
    } = req.journeyData.scheduleTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    const prefillStartTime = startTimeWithClash ?? startTime
    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && prefillStartTime
        ? prefillStartTime.split(':')
        : []

    return res.render('schedule-a-transfer/transfer-details/view', {
      backUrl,
      startDate: res.locals.formResponses?.['startDate'] ?? formatInputDate(startDateWithClash ?? startDate),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
      destination:
        res.locals.formResponses?.['destination'] ?? destinationWithNonAssociation?.code ?? destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logistics: res.locals.formResponses?.['logistics'] ?? logistics?.code,
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      comments: res.locals.formResponses?.['comments'] ?? comments,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.scheduleTransfer!

    const nonAssociations = await this.nonAssociationsService.getPrisonerNonAssociations(
      { res },
      req.journeyData.prisonerDetails!.prisonerNumber,
    )

    journey.nonAssociations = nonAssociations.nonAssociations
      .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
      .filter(({ prisonId }) => prisonId === req.body.destination.code)

    journey.clashes = await this.checkClashesService.getClashes(
      { res },
      req.journeyData.prisonerDetails!.prisonerNumber,
      `${req.body.startDate}T00:00:00`,
      `${req.body.startDate}T23:59:59`,
    )

    journey.reason = req.body.reason!
    journey.logistics = req.body.logistics!
    journey.comments = req.body.comments ?? null
    if (journey.clashes?.length) {
      journey.startDateWithClash = req.body.startDate!
      journey.startTimeWithClash = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    } else {
      journey.startDate = req.body.startDate!
      journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    }
    if (journey.nonAssociations.length) {
      journey.destinationWithNonAssociation = req.body.destination
    } else {
      journey.destination = req.body.destination
    }

    if (journey.clashes?.length || journey.nonAssociations.length) {
      res.redirect('conflicts')
      return
    }

    res.redirect('check-answers')
  }
}
