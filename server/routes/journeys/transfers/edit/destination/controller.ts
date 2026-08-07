import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import PrisonRegisterService from '../../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferDestinationController {
  constructor(
    private readonly transferSchedulerService: TransferSchedulerService,
    private readonly prisonRegisterService: PrisonRegisterService,
  ) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    const prisons = await this.prisonRegisterService.getPrisons({ res })
    if (!prisons) throw new Error('Unable to get list of prisons')

    res.render('transfers/edit/destination/view', {
      transfer,
      backUrl,
      destination: res.locals.formResponses?.['destination'] ?? transfer.destination?.code,
      prisons: prisons.filter(({ code }) => code !== res.locals.user.getActiveCaseloadId()),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyDestination',
        destinationCode: req.body.destination?.code ?? null,
      })

      req.journeyData.journeyCompleted = true
      req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer destination changed')
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
