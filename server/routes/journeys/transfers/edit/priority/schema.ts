import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformCodedDescription } from '../../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'

const ERR_MESSAGE = 'Select the priority of this transfer'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const options = await transferSchedulerService.getReferenceData({ res }, 'transfer-priority')

    return createSchema({
      priority: z.string({ error: ERR_MESSAGE }).transform(validateAndTransformCodedDescription(options, ERR_MESSAGE)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
