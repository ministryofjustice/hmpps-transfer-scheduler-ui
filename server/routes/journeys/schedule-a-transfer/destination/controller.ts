import { Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'

export class ScheduleTransferDestinationController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  GET = async (req: Request, res: Response) => {
    const { destination } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/destination/view', {
      backUrl: 'date-and-time',
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      prisons: await this.prisonRegisterService.getPrisons({ res }),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.destination = req.body.destination
    res.redirect('reason')
  }
}
