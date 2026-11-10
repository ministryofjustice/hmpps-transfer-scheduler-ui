import { z } from 'zod'
import { differenceInDays } from 'date-fns'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'

export const schema = createSchema({
  start: validateTransformOptionalDate('date from'),
  end: validateTransformOptionalDate('date to'),
  destination: z.string().optional(),
  reason: z.string().optional(),
  logistics: z.string().optional(),
  sort: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform(val => {
      if (!val) return 1
      const num = Number(val)
      if (!Number.isNaN(num)) return num
      return 1
    }),
}).transform(({ start, end, ...otherProps }, ctx) => {
  if (start === null) {
    ctx.addIssue({ code: 'custom', message: 'Enter or select date from', path: ['start'] })
  }

  if (end === null) {
    ctx.addIssue({ code: 'custom', message: 'Enter or select date to', path: ['end'] })
  }

  if (start && end) {
    if (start > end) {
      ctx.addIssue({ code: 'custom', message: 'Enter a valid date range', path: ['end'] })
      ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
    }

    if (differenceInDays(end, start) > 31) {
      ctx.addIssue({ code: 'custom', message: 'Enter a date range less than 31 days', path: ['end'] })
      ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
    }
  }

  if (ctx.issues.length) {
    return z.NEVER
  }

  return {
    start,
    end,
    ...otherProps,
  }
})

export type SchemaType = z.infer<typeof schema>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
