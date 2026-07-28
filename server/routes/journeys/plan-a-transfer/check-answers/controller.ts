import { NextFunction, Request, Response } from 'express'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { components } from '../../../../@types/transferSchedulerApi'

export class PlanTransferCheckAnswersController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    req.journeyData.isCheckAnswers = true

    const { requestedOn, priority, startDate, startTime, destination, reason, logistics, comments } =
      req.journeyData.planTransfer!

    res.render('plan-a-transfer/check-answers/view', {
      backUrl: 'check-answers/back',
      requestedOn,
      priority,
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
      const journey = req.journeyData.planTransfer!

      const request: components['schemas']['CreateTransferRequest'] = {
        plan: {
          requestedOn: journey.requestedOn!,
          priorityCode: journey.priority!.code,
        },
        reasonCode: journey.reason!.code,
      }

      if (journey.startDate && journey.startTime) {
        request.schedule = { start: `${journey.startDate}T${journey.startTime}:00` }
      }

      if (journey.destination) {
        request.destinationCode = journey.destination.code
      }

      if (journey.logistics) {
        request.logisticsCode = journey.logistics.code
      }

      if (journey.comments) {
        request.plan!.comments = journey.comments
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
