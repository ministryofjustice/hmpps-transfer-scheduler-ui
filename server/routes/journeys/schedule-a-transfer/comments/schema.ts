import { z } from 'zod'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { optionalString } from '../../../../utils/validations/validateString'

const ERROR_MSG = 'The maximum character limit is 225'

export const schema = createSchema({
  comments: optionalString({ maxChar: { count: 225, errorMessage: ERROR_MSG } }),
})

export type SchemaType = z.infer<typeof schema>
