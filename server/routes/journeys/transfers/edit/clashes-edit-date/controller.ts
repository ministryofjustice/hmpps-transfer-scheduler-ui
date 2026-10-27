import { NextFunction, Request, Response } from 'express'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferClashesEditDateController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { clashes, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/clashes-edit-date/view', {
      goBackUrl: backUrl,
      clashes,
    })
  }

  submitToApi = async (req: Request, res: Response, next: NextFunction) => {
    const { transfer, startDate, startTime } = req.journeyData.updateTransfer!

    try {
      const result = await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: 'ApplyScheduleStart',
        start: `${startDate}T${startTime}:00`,
      })

      req.journeyData.journeyCompleted = true
      if (result.content.length) {
        req.flash(FLASH_KEY__SUCCESS_BANNER, 'Transfer date and time changed')
      }
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
