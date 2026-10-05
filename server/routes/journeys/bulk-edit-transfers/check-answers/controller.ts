import { NextFunction, Request, Response } from 'express'
import { v7 } from 'uuid'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { components } from '../../../../@types/transferSchedulerApi'

export class BulkEditTransfersCheckAnswersController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true
    delete req.journeyData.bulkEditTransfer!.prisonerToAdd

    const { startDate, startTime, destination, transfers, selectedTransfers } = req.journeyData.bulkEditTransfer!

    res.render('bulk-edit-transfers/check-answers/view', {
      backUrl: 'check-answers/back',
      startDate,
      startTime,
      destination,
      transfers: transfers.filter(({ prisoner }) => selectedTransfers!.includes(prisoner.identifier ?? '')),
    })
  }

  BACK = async (req: Request, res: Response) => {
    delete req.journeyData.isCheckAnswers
    res.redirect('../edit-list')
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { startDate, startTime, destination, transfers, selectedTransfers } = req.journeyData.bulkEditTransfer!

      const request: components['schemas']['BulkTransfersRequest'] = {
        transfers: transfers
          .filter(({ prisoner }) => selectedTransfers!.includes(prisoner.identifier ?? ''))
          .map(itm => {
            const transfer: components['schemas']['BulkTransfer'] = {
              id: itm.id ?? v7(),
              personIdentifier: itm.prisoner.identifier,
              start: `${startDate}T${startTime}:00`,
              destinationCode: destination!.code,
              reasonCode: itm.reason!.code,
              logisticsCode: itm.logistics!.code,
              statusCode: 'SCHEDULED',
            }

            if (itm.comments) {
              transfer.comments = itm.comments
            }
            return transfer
          }),
      }

      req.journeyData.bulkEditTransfer!.result = await this.transferSchedulerService.bulkScheduleTransfers(
        { res },
        request,
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    req.journeyData.journeyCompleted = true
    res.redirect('confirmation')
  }
}
