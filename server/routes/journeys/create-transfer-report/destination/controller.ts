import { Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'

export class CreateTransferReportDestinationController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  GET = async (req: Request, res: Response) => {
    const { destination } = req.journeyData.createTransferReport!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    res.render('create-transfer-report/destination/view', {
      backUrl: 'select-transfer',
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.createTransferReport!.destination = req.body.destination
    res.redirect('report')
  }
}
