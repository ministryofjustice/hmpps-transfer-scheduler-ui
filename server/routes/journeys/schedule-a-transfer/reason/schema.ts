import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

const ERR_MESSAGE = 'Enter and select a reason'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const reasons = await transferSchedulerService.getReferenceData({ res }, 'transfer-reason')

    return createSchema({
      reason: z.string({ error: ERR_MESSAGE }).transform(validateAndTransformCodedDescription(reasons, ERR_MESSAGE)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
