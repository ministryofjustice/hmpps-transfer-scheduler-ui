import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'

export class MoveTransferToPlanningRequestDateController {
  GET = async (req: Request, res: Response) => {
    const { backUrl, requestedOn } = req.journeyData.moveTransferToPlanning!

    res.render('transfers/move-to-planning/request-date/view', {
      backUrl,
      requestedOn: res.locals.formResponses?.['requestedOn'] ?? formatInputDate(requestedOn),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.moveTransferToPlanning!.requestedOn = req.body.requestedOn
    res.redirect('priority')
  }
}
