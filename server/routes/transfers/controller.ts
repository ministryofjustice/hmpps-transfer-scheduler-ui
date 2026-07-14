import { Request, Response } from 'express'
import { isTransferCancellable, isTransferEditable, isTransferScheduled } from '../../utils/utils'
import { parseAuditHistory } from '../../views/partials/auditHistory/parseAuditHistory'
import PrisonRegisterService from '../../services/apis/prisonRegisterService'

export class ManageTransferController {
  constructor(private readonly prisonRegisterService: PrisonRegisterService) {}

  GET = async (req: Request, res: Response) => {
    const prisons = await this.prisonRegisterService.getPrisons({ res })

    const prisonRegistryError =
      !prisons &&
      req.middleware!.transferHistory!.content.find(({ changes }) =>
        changes?.find(({ propertyName }) => propertyName === 'destination'),
      )

    res.render('transfers/view', {
      showBreadcrumbs: true,
      transfer: req.middleware!.transfer,
      auditedActions: parseAuditHistory(
        req.middleware!.transferHistory!.content.sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)),
        { prisons: prisons ?? [] },
      ),
      editable: isTransferEditable(req.middleware!.transfer!),
      cancellable: isTransferCancellable(req.middleware!.transfer!),
      isScheduled: isTransferScheduled(req.middleware!.transfer!),
      prisonRegistryError,
    })
  }
}
