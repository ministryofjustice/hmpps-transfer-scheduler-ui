import { z } from 'zod'
import { Request, Response } from 'express'
import {
  validateAndTransformCodedDescription,
  validateAndTransformOptionalCodedDescription,
} from '../../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import PrisonRegisterService from '../../../../../services/apis/prisonRegisterService'

const ERR_MESSAGE = 'Enter and select a prison'

export const schemaFactory = (prisonRegisterService: PrisonRegisterService) => async (req: Request, res: Response) => {
  const prisons = await prisonRegisterService.getPrisons({ res })

  return createSchema({
    destination:
      req.journeyData.updateTransfer!.transfer.stage === 'PLANNING'
        ? z.string().optional().transform(validateAndTransformOptionalCodedDescription(prisons, ERR_MESSAGE)).optional()
        : z.string().transform(validateAndTransformCodedDescription(prisons, ERR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
