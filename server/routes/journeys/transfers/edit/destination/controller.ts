import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'
import NonAssociationsService from '../../../../../services/apis/nonAssociationsService'

export class EditTransferDestinationController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
    private readonly nonAssociationsService: NonAssociationsService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl, destination } = req.journeyData.updateTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    res.render('transfers/edit/destination/view', {
      transfer,
      backUrl,
      destination: res.locals.formResponses?.['destination'] ?? destination?.code ?? transfer.destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    if (req.body.destination) {
      const nonAssociations = await this.nonAssociationsService.getPrisonerNonAssociations(
        { res },
        req.journeyData.prisonerDetails!.prisonerNumber,
      )

      req.journeyData.updateTransfer!.nonAssociations = nonAssociations.nonAssociations
        .map(({ otherPrisonerDetails }) => otherPrisonerDetails)
        .filter(({ prisonId }) => prisonId === req.body.destination!.code)

      if (req.journeyData.updateTransfer!.nonAssociations.length) {
        req.journeyData.updateTransfer!.destination = req.body.destination
        res.redirect('non-associations')
        return
      }
    }

    try {
      const { transfer } = req.journeyData.updateTransfer!

      const result = await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyDestination',
        destinationCode: req.body.destination?.code ?? null,
      })

      req.journeyData.journeyCompleted = true
      if (result.content.length) {
        req.flash(
          FLASH_KEY__SUCCESS_BANNER,
          transfer.destination ? 'Transfer destination changed' : 'Transfer destination added',
        )
      }
      res.redirect(req.journeyData.updateTransfer!.backUrl)
    } catch (e) {
      next(e)
    }
  }
}
