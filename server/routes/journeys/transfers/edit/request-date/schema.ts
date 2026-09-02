import { z } from 'zod'

import { createSchema } from '../../../../../middleware/validation/validationMiddleware'
import { checkTodayOrPast, validateTransformDate } from '../../../../../utils/validations/validateDatePicker'

export const schema = createSchema({
  requestedOn: validateTransformDate(checkTodayOrPast(), 'request date', 'Request date must be today or in the past'),
})

export type SchemaType = z.infer<typeof schema>
