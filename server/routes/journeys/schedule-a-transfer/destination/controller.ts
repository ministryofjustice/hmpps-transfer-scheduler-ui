import { Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import NonAssociationsService from '../../../../services/apis/nonAssociationsService'

export class ScheduleTransferDestinationController {
  constructor(
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly nonAssociationsService: NonAssociationsService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { destination } = req.journeyData.scheduleTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    res.render('schedule-a-transfer/destination/view', {
      backUrl: 'date-and-time',
      destination: res.locals.formResponses?.['destination'] ?? destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.destination = req.body.destination

    const nonAssociations = await this.nonAssociationsService.getPrisonerNonAssociations(
      { res },
      req.journeyData.prisonerDetails!.prisonerNumber,
    )

    req.journeyData.scheduleTransfer!.nonAssociations = nonAssociations.nonAssociations
      .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
      .filter(({ prisonId }) => prisonId === req.body.destination.code)

    if (req.journeyData.scheduleTransfer!.nonAssociations.length) {
      res.redirect('non-associations')
    } else {
      res.redirect('reason')
    }
  }
}
