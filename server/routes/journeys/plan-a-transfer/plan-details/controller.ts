import { Request, Response } from 'express'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'
import NonAssociationsService from '../../../../services/apis/nonAssociationsService'

export class PlanTransferDetailsController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly nonAssociationsService: NonAssociationsService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const {
      backUrl,
      requestedOn,
      priority,
      startDate,
      startTime,
      destination,
      destinationWithNonAssociation,
      reason,
      logistics,
      comments,
    } = req.journeyData.planTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && startTime
        ? startTime.split(':')
        : []

    return res.render('plan-a-transfer/plan-details/view', {
      backUrl,
      requestedOn: res.locals.formResponses?.['requestedOn'] ?? formatInputDate(requestedOn),
      priority: res.locals.formResponses?.['priority'] ?? priority?.code,
      priorityOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-priority'),
      startDate: res.locals.formResponses?.['startDate'] ?? formatInputDate(startDate),
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
    const journey = req.journeyData.planTransfer!

    if (req.body.destination?.code) {
      const nonAssociations = await this.nonAssociationsService.getPrisonerNonAssociations(
        { res },
        req.journeyData.prisonerDetails!.prisonerNumber,
      )

      journey.nonAssociations = nonAssociations.nonAssociations
        .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
        .filter(({ prisonId }) => prisonId === req.body.destination!.code)
    }

    journey.requestedOn = req.body.requestedOn
    journey.priority = req.body.priority
    journey.reason = req.body.reason
    journey.comments = req.body.comments ?? null

    if (req.body.startDate) {
      journey.startDate = req.body.startDate
    } else {
      delete journey.startDate
    }

    if (req.body.startTimeHour && req.body.startTimeMinute) {
      journey.startTime = `${req.body.startTimeHour}:${req.body.startTimeMinute}`
    } else {
      delete journey.startTime
    }

    if (req.body.logistics) {
      journey.logistics = req.body.logistics
    } else {
      delete journey.logistics
    }

    if (req.body.destination) {
      if (journey.nonAssociations?.length) {
        journey.destinationWithNonAssociation = req.body.destination
      } else {
        journey.destination = req.body.destination
      }
    } else {
      delete journey.destination
    }

    if (journey.nonAssociations?.length) {
      res.redirect('non-associations')
      return
    }

    res.redirect('check-answers')
  }
}
