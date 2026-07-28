import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class PlanTransferCommentsController {
  GET = async (req: Request, res: Response) => {
    const { comments } = req.journeyData.planTransfer!

    res.render('plan-a-transfer/comments/view', {
      backUrl: 'logistics',
      comments: res.locals.formResponses?.['comments'] ?? comments,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.planTransfer!.comments = req.body.comments
    res.redirect('check-answers')
  }
}
