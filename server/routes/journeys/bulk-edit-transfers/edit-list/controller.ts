import { Request, Response } from 'express'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import NonAssociationsService from '../../../../services/apis/nonAssociationsService'

export class BulkEditTransfersEditListController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly nonAssociationsService: NonAssociationsService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { transfers, startDate, startTime, destination, reason, logistics, comments, selectedTransfers } =
      req.journeyData.bulkEditTransfer!

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
      reason: res.locals.formResponses?.['reason'] ?? reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logistics: res.locals.formResponses?.['logistics'] ?? logistics?.code,
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      comments: res.locals.formResponses?.['comments'] ?? comments,
      selectedTransfers: res.locals.formResponses?.['selectedTransfers'] ?? selectedTransfers,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

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
    if (req.body.destination) {
      journey.destination = req.body.destination
    } else {
      delete journey.destination
    }
    if (req.body.logistics) {
      journey.logistics = req.body.logistics
    } else {
      delete journey.logistics
    }
    if (req.body.reason) {
      journey.reason = req.body.reason
      if (req.body.selectedTransfers) {
        journey
          .transfers!.filter(({ prisoner }) => req.body.selectedTransfers!.includes(prisoner.identifier))
          .forEach(transfer => {
            // eslint-disable-next-line no-param-reassign
            transfer.reason = req.body.reason!
          })
      }
    } else {
      delete journey.reason
    }
    if (req.body.comments) {
      journey.comments = req.body.comments
      if (req.body.selectedTransfers) {
        journey
          .transfers!.filter(({ prisoner }) => req.body.selectedTransfers!.includes(prisoner.identifier))
          .forEach(transfer => {
            // eslint-disable-next-line no-param-reassign
            transfer.comments = req.body.comments
          })
      }
    } else {
      delete journey.comments
    }
    if (req.body.selectedTransfers) journey.selectedTransfers = req.body.selectedTransfers!

    if (req.body.add !== undefined) {
      res.redirect('search-prisoner')
    } else {
      journey.nonAssociations = (
        await Promise.all(
          journey
            .transfers!.filter(({ prisoner }) => journey.selectedTransfers!.includes(prisoner.identifier))
            .map(({ prisoner, destination }) =>
              this.nonAssociationsService
                .getPrisonerNonAssociations({ res }, prisoner.identifier)
                .then(({ nonAssociations }) => ({
                  prisoner,
                  destination: journey.destination?.description ?? destination!.description,
                  otherPrisoners: nonAssociations
                    .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
                    .filter(({ prisonId }) => prisonId === (journey.destination?.code ?? destination?.code)),
                })),
            ),
        )
      ).filter(({ otherPrisoners }) => otherPrisoners.length)

      if (journey.nonAssociations.length) {
        res.redirect('non-associations')
      } else {
        res.redirect('check-answers')
      }
    }
  }
}
