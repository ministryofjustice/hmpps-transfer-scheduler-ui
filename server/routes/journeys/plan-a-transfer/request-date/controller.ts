import { Request, Response } from 'express'
import { SchemaType } from './schema'
import { formatInputDate } from '../../../../utils/dateTimeUtils'

export class PlanTransferRequestDateController {
  GET = async (req: Request, res: Response) => {
    const { backUrl, requestedOn } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/request-date/view', {
      backUrl,
      requestedOn: res.locals.formResponses?.['requestedOn'] ?? formatInputDate(requestedOn),
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.planTransfer!.requestedOn = req.body.requestedOn
    res.redirect('reason')
  }
}
