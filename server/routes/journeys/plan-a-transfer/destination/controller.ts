import { Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'

export class PlanTransferDestinationController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  GET = async (req: Request, res: Response) => {
    const { destination } = req.journeyData.planTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    res.render('plan-a-transfer/destination/view', {
      backUrl: 'date-and-time',
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    if (req.body.destination) {
      req.journeyData.planTransfer!.destination = req.body.destination
    } else {
      delete req.journeyData.planTransfer!.destination
    }

    res.redirect('logistics')
  }
}
