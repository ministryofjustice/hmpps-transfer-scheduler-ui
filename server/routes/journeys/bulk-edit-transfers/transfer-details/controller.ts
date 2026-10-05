import { Request, Response } from 'express'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { SchemaType } from './schema'

export class BulkEditTransfersDetailsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfers, prisonerToAdd } = req.journeyData.bulkEditTransfer!

    const transfer = transfers!.find(
      ({ prisoner }) => prisoner.identifier === req.middleware!.prisonerData!.prisonerNumber,
    )

    if (!transfer && prisonerToAdd?.identifier !== req.middleware!.prisonerData!.prisonerNumber) {
      return res.notFound()
    }

    return res.render('bulk-edit-transfers/transfer-details/view', {
      // eslint-disable-next-line no-nested-ternary
      backUrl: prisonerToAdd
        ? '../search-prisoner'
        : req.journeyData.isCheckAnswers
          ? '../check-answers'
          : '../edit-list',
      reason: res.locals.formResponses?.['reason'] ?? transfer?.reason?.code,
      reasons: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-reason'),
      logistics: res.locals.formResponses?.['logistics'] ?? transfer?.logistics?.code,
      logisticsOptions: await this.transferSchedulerService.getReferenceData({ res }, 'transfer-logistics'),
      comments: res.locals.formResponses?.['comments'] ?? transfer?.comments,
    })
  }

  POST = async (req: Request<{ prisonNumber: string }, unknown, SchemaType>, res: Response) => {
    const journey = req.journeyData.bulkEditTransfer!

    const transfer = journey.transfers!.find(({ prisoner }) => prisoner.identifier === req.params.prisonNumber)

    if (transfer) {
      transfer.reason = req.body.reason!
      transfer.logistics = req.body.logistics!
      transfer.comments = req.body.comments ?? null
    } else if (journey.prisonerToAdd?.identifier === req.params.prisonNumber) {
      journey.transfers.push({
        prisoner: journey.prisonerToAdd,
        reason: req.body.reason!,
        logistics: req.body.logistics!,
        comments: req.body.comments ?? null,
      })
      journey.selectedTransfers ??= []
      journey.selectedTransfers.push(journey.prisonerToAdd.identifier)
    } else {
      return res.notFound()
    }

    return res.redirect(req.journeyData.isCheckAnswers ? '../check-answers' : '../edit-list')
  }
}
