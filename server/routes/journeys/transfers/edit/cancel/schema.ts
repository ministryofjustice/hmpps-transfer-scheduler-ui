import { z } from 'zod'
import { Request, Response } from 'express'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { optionalString } from '../../../../../utils/validations/validateString'
import TransferSchedulerService from '../../../../../services/apis/transferSchedulerService'
import { validateAndTransformOptionalCodedDescription } from '../../../../../utils/validations/validateCodedDescription'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const options = await transferSchedulerService.getReferenceData({ res }, 'transfer-cancellation-reason')

    return createSchema({
      confirm: z
        .enum(['YES', 'NO'], { message: 'Select if you want to cancel this transfer' })
        .transform(val => val === 'YES'),
      cancellationReason: z
        .string()
        .optional()
        .transform(validateAndTransformOptionalCodedDescription(options, 'Select a cancellation reason')),
      reason: optionalString(),
    }).superRefine(({ confirm, cancellationReason }, ctx) => {
      if (confirm && !cancellationReason) {
        ctx.addIssue({
          code: 'custom',
          message: 'Select a cancellation reason',
          path: ['cancellationReason'],
        })
      }
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
