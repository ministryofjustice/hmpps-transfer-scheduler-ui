import { Request, Response } from 'express'
import { isTransferCancellable, isTransferEditable, isTransferScheduled } from '../../utils/utils'

export class ManageTransferController {
  GET = async (req: Request, res: Response) => {
    res.render('transfers/view', {
      showBreadcrumbs: true,
      transfer: req.middleware!.transfer,
      editable: isTransferEditable(req.middleware!.transfer!),
      cancellable: isTransferCancellable(req.middleware!.transfer!),
      isScheduled: isTransferScheduled(req.middleware!.transfer!),
    })
  }
}
