import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { optionalString } from '../../../../utils/validations/validateString'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const reasons = await transferSchedulerService.getReferenceData({ res }, 'transfer-reason')

    return createSchema({
      reason: z.string().transform(validateAndTransformCodedDescription(reasons, 'Enter a reason for this transfer')),
      comments: optionalString({
        maxChar: { count: 225, errorMessage: 'The maximum character limit for comments is 225' },
      }),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
