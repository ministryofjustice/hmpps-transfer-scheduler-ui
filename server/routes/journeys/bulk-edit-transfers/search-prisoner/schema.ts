import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'

export const schema = createSchema({
  searchTerm: z
    .string()
    .optional()
    .transform(val => val?.replace(/[\r\n]/g, '').trim()),
})

export type SchemaType = z.infer<typeof schema>
