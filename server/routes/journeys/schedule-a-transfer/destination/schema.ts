import { z } from 'zod'
import { Request, Response } from 'express'
import { validateAndTransformCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'

const ERR_MESSAGE = 'Enter and select a prison'

export const schemaFactory = (prisonRegisterService: PrisonRegisterService) => async (_req: Request, res: Response) => {
  const prisons = await prisonRegisterService.getPrisons({ res })

  return createSchema({
    destination: z.string({ error: ERR_MESSAGE }).transform(validateAndTransformCodedDescription(prisons, ERR_MESSAGE)),
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
