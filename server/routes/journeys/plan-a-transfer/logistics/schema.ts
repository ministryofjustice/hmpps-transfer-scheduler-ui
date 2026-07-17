import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformOptionalCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'

const ERR_MESSAGE = 'Enter and select an escort type'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const options = await transferSchedulerService.getReferenceData({ res }, 'transfer-logistics')

    return createSchema({
      logistics: z.string().optional().transform(validateAndTransformOptionalCodedDescription(options, ERR_MESSAGE)),
    })
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
