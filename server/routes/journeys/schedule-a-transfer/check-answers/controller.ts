import { NextFunction, Request, Response } from 'express'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { components } from '../../../../@types/transferSchedulerApi'

export class ScheduleTransferCheckAnswersController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { startDate, startTime, destination, reason, logistics, comments } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/check-answers/view', {
      backUrl: 'check-answers/back',
      startDate,
      startTime,
      destination,
      reason,
      logistics,
      comments,
    })
  }

  BACK = async (req: Request, res: Response) => {
    delete req.journeyData.isCheckAnswers
    res.redirect('../comments')
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const journey = req.journeyData.scheduleTransfer!

      const request: components['schemas']['CreateTransferRequest'] = {
        schedule: {
          start: `${journey.startDate}T${journey.startTime}:00`,
        },
        reasonCode: journey.reason!.code,
        destinationCode: journey.destination!.code,
        logisticsCode: journey.logistics!.code,
      }

      if (journey.comments) {
        request.schedule!.comments = journey.comments
      }

      journey.result = await this.transferSchedulerService.postScheduledTransfer(
        { res },
        req.journeyData.prisonerDetails!.prisonerNumber,
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
