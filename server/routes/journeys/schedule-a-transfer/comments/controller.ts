import { Request, Response } from 'express'
import { SchemaType } from './schema'

export class ScheduleTransferCommentsController {
  GET = async (req: Request, res: Response) => {
    const { comments } = req.journeyData.scheduleTransfer!

    res.render('schedule-a-transfer/comments/view', {
      backUrl: 'logistics',
      comments: res.locals.formResponses?.['comments'] ?? comments,
    })
  }

  POST = async (req: Request<unknown, unknown, SchemaType>, res: Response) => {
    req.journeyData.scheduleTransfer!.comments = req.body.comments
    res.redirect('check-answers')
  }
}
