import { z } from 'zod'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schema = createSchema({
  startDate: z.string().optional(),
  startTimeHour: z.string().optional(),
  startTimeMinute: z.string().optional(),
}).transform(({ startDate, startTimeHour, startTimeMinute }, ctx) => {
  const parsedStartDate = validateTransformDate(
    checkTodayOrFuture,
    'Enter or select a date',
    'Enter or select a valid date',
    'Transfer date must be today or in the future',
  ).safeParse(startDate)

  parsedStartDate.error?.issues?.forEach(issue =>
    ctx.addIssue({ ...issue, path: ['startDate'] } as $ZodSuperRefineIssue),
  )

  const parsedHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
  const parsedMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

  if (!startTimeHour?.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a time',
      path: ['startTimeHour'],
    })
    if (!startTimeMinute?.length) {
      // empty error message to highlight both input fields with error
      ctx.addIssue({ code: 'custom', message: '', path: ['startTime'] })
    }
  } else if (!startTimeMinute?.length) {
    ctx.addIssue({
      code: 'custom',
      message: 'Enter a time',
      path: ['startTimeMinute'],
    })
  }

  if (parsedHour?.error) {
    ctx.addIssue({
      code: 'custom',
      message: 'Hour must be between 00 and 23',
      path: ['startTimeHour'],
    })
  }
  if (parsedMinute?.error) {
    ctx.addIssue({
      code: 'custom',
      message: 'Minute must be between 00 and 59',
      path: ['startTimeMinute'],
    })
  }

  if (parsedStartDate?.success && parsedHour?.success && parsedMinute?.success) {
    return {
      startDate: parsedStartDate.data,
      startTimeHour: parsedHour.data,
      startTimeMinute: parsedMinute.data,
    }
  }

  return z.NEVER
})

export type SchemaType = z.infer<typeof schema>
