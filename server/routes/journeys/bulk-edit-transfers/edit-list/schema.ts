import { z } from 'zod'
import { Request, Response } from 'express'
import { isToday } from 'date-fns'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { validateAndTransformOptionalCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import { checkTodayOrFuture, validateTransformDate } from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schemaFactory = (prisonRegisterService: PrisonRegisterService) => async (_req: Request, res: Response) => {
  const prisons = await prisonRegisterService.getPrisons({ res })

  return createSchema({
    startDate: z.string().optional(),
    startTimeHour: z.string().optional(),
    startTimeMinute: z.string().optional(),
    destination: z
      .string()
      .optional()
      .transform(validateAndTransformOptionalCodedDescription(prisons, 'Enter and select a prison'))
      .optional(),
    selectedTransfers: z.union([z.string().transform(val => [val]), z.array(z.string())]).optional(),
  }).transform(({ startDate, startTimeHour, startTimeMinute, destination, selectedTransfers }, ctx) => {
    const parsedStartDate = validateTransformDate(
      checkTodayOrFuture,
      'transfer date',
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
        message: 'Enter a transfer time',
        path: ['startTimeHour'],
      })
      if (!startTimeMinute?.length) {
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['startTime'] })
      }
    } else if (!startTimeMinute?.length) {
      ctx.addIssue({
        code: 'custom',
        message: 'Enter a transfer time',
        path: ['startTimeMinute'],
      })
    }

    if (parsedHour?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Transfer hour must be between 00 and 23',
        path: ['startTimeHour'],
      })
    }
    if (parsedMinute?.error) {
      ctx.addIssue({
        code: 'custom',
        message: 'Transfer minute must be between 00 and 59',
        path: ['startTimeMinute'],
      })
    }

    if (parsedStartDate?.success && parsedHour?.success && parsedMinute?.success) {
      if (
        isToday(new Date(parsedStartDate.data)) &&
        `${parsedHour.data}:${parsedMinute.data}` <= new Date().toLocaleTimeString('en-GB').substring(0, 5)
      ) {
        ctx.addIssue({
          code: 'custom',
          message: 'Start time must be in the future',
          path: ['startTimeHour'],
        })
        // empty error message to highlight both input fields with error
        ctx.addIssue({ code: 'custom', message: '', path: ['startTime'] })
        return z.NEVER
      }
    }

    if (!destination) ctx.addIssue({ code: 'custom', message: 'Enter and select a prison', path: ['destination'] })
    if (!selectedTransfers?.length)
      ctx.addIssue({ code: 'custom', message: 'Select transfers to be edited', path: ['selectedTransfers-1'] })

    if (ctx.issues.length) {
      return z.NEVER
    }
    return {
      startDate: parsedStartDate.data!,
      startTimeHour: parsedHour!.data,
      startTimeMinute: parsedMinute!.data,
      destination: destination!,
      selectedTransfers,
    }
  })
}

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
