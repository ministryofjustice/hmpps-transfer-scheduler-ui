import { NextFunction, Request, Response } from 'express'
import { SchemaType } from './schema'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { FLASH_KEY__SUCCESS_BANNER } from '../../../../../utils/constants'

export class EditTransferCommentsController {
  constructor(private readonly transferSchedulerService: TransferSchedulerService) {}

  GET = async (req: Request, res: Response) => {
    const { transfer, backUrl } = req.journeyData.updateTransfer!

    res.render('transfers/edit/comments/view', {
      transfer,
      backUrl,
      comments:
        res.locals.formResponses?.['comments'] ??
        (transfer.stage === 'PLANNING' ? transfer.plan?.comments : transfer.schedule?.comments),
    })
  }

  submitToApi = async (req: Request<unknown, unknown, SchemaType>, res: Response, next: NextFunction) => {
    try {
      const { transfer } = req.journeyData.updateTransfer!

      await this.transferSchedulerService.updateTransfer({ res }, transfer.id, {
        type: transfer.stage === 'PLANNING' ? 'ApplyPlanComments' : 'ApplyScheduleComments',
        comments: req.body.comments,
      })

      req.journeyData.journeyCompleted = true
      req.flash(
        FLASH_KEY__SUCCESS_BANNER,
        transfer.stage === 'PLANNING' ? 'Transfer plan comments changed' : 'Transfer schedule comments changed',
      )
      next()
    } catch (e) {
      next(e)
    }
  }

  POST = async (req: Request, res: Response) => {
    res.redirect(req.journeyData.updateTransfer!.backUrl)
  }
}
