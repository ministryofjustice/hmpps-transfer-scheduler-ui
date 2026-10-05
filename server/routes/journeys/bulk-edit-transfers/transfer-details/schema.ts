import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { optionalString } from '../../../../utils/validations/validateString'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const reasons = await transferSchedulerService.getReferenceData({ res }, 'transfer-reason')
    const logisticsOptions = await transferSchedulerService.getReferenceData({ res }, 'transfer-logistics')

    return createSchema({
      reason: z.string().transform(validateAndTransformCodedDescription(reasons, 'Enter a reason for this transfer')),
      logistics: z
        .string()
        .transform(
          validateAndTransformCodedDescription(logisticsOptions, 'Enter the escort type being used for this transfer'),
        ),
      comments: optionalString(),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
