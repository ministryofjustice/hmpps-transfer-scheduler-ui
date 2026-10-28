import { z } from 'zod'
import { createSchema } from '../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  duration: z.enum(['1', '24', '72', '168']).transform(val => {
    const num = Number(val)
    if (!Number.isNaN(num)) return num
    return 1
  }),
})

export type SchemaType = z.infer<typeof schema>
