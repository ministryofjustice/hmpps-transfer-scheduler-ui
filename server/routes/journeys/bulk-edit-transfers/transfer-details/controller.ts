import { Request, Response } from 'express'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { SchemaType } from '../../bulk-schedule-transfers/transfer-details/schema'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../utils/constants'
import { firstNameSpaceLastName } from '../../../../utils/formatUtils'

export class BulkEditTransfersDetailsController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { prisonerToAdd, startDate, startTime, destination, reason, logistics, comments } =
      req.journeyData.bulkEditTransfer!

    if (prisonerToAdd?.identifier !== req.middleware!.prisonerData!.prisonerNumber) {
      return res.notFound()
    }

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    const [startTimeHour, startTimeMinute] =
      !res.locals.formResponses?.['startTimeHour'] && !res.locals.formResponses?.['startTimeMinute'] && startTime
        ? startTime.split(':')
        : []

    return res.render('bulk-edit-transfers/transfer-details/view', {
      backUrl: '../search-prisoner',
      startDate: res.locals.formResponses?.['startDate'] ?? (startDate ? formatInputDate(startDate) : null),
      startTimeHour: res.locals.formResponses?.['startTimeHour'] ?? startTimeHour,
      startTimeMinute: res.locals.formResponses?.['startTimeMinute'] ?? startTimeMinute,
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logistics: res.locals.formResponses?.['logistics'] ?? logistics?.code,
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      comments: res.locals.formResponses?.['comments'] ?? comments,
      prisoner: prisonerToAdd,
    })
  }

  POST = async (req: Request<{ prisonNumber: string }, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

    if (journey.prisonerToAdd?.identifier === req.params.prisonNumber) {
      journey.transfers.push({
        prisoner: journey.prisonerToAdd,
        startDate: req.body.startDate,
        startTime: `${req.body.startTimeHour}:${req.body.startTimeMinute}`,
        destination: req.body.destination,
        reason: req.body.reason!,
        logistics: req.body.logistics!,
        comments: req.body.comments ?? null,
      })
      journey.selectedTransfers ??= []
      journey.selectedTransfers.push(journey.prisonerToAdd.identifier)

      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        `${firstNameSpaceLastName(journey.prisonerToAdd)} has been added to this list of scheduled transfers`,
      )
    } else {
      return res.notFound()
    }

    return res.redirect('../edit-list')
  }
}
