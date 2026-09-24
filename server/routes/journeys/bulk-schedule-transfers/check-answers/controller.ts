import { NextFunction, Request, Response } from 'express'
import { v7 } from 'uuid'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { components } from '../../../../@types/transferSchedulerApi'

export class BulkScheduleTransfersCheckAnswersController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { transfers } = req.journeyData.bulkScheduleTransfer!

    res.render('bulk-schedule-transfers/check-answers/view', {
      backUrl: 'check-answers/back',
      transfers,
    })
  }

  BACK = async (req: Request, res: Response) => {
    delete req.journeyData.isCheckAnswers
    const { transfers } = req.journeyData.bulkScheduleTransfer!
    res.redirect(`../transfer-details/${transfers![transfers!.length - 1]!.prisoner.prisonerNumber}`)
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.bulkScheduleTransfer!

      const request: components['schemas']['BulkTransfersRequest'] = {
        transfers: journey.transfers!.map(itm => {
          const transfer: components['schemas']['BulkTransfer'] = {
            id: v7(),
            personIdentifier: itm.prisoner.prisonerNumber,
            start: `${itm.startDate}T${itm.startTime}:00`,
            destinationCode: itm.destination!.code,
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

      journey.result = await this.transferSchedulerService.bulkScheduleTransfers({ res }, request)
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
