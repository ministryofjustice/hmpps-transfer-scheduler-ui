import { z } from 'zod'
import { addDays, differenceInDays, format } from 'date-fns'
import { Request, Response } from 'express'
import { createSchema } from '../../middleware/validation/validationMiddleware'
import { validateTransformOptionalDate } from '../../utils/validations/validateDatePicker'
import TransferSchedulerService from '../../services/apis/transferSchedulerService'

const statusEnum = z.enum(['PLANNING', 'READY_TO_SCHEDULE', 'CANCELLED'])

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService) => async (_req: Request, res: Response) => {
    const priorityOptions = await transferSchedulerService.getReferenceData({ res }, 'transfer-priority')
    const priorityEnum = z.enum(priorityOptions.map(({ code }) => code))

    return createSchema({
      searchTerm: z
        .string()
        .optional()
        .transform(val => val?.replace(/[\r\n]/g, '').trim()),
      start: validateTransformOptionalDate('date from'),
      end: validateTransformOptionalDate('date to'),
      destination: z.string().optional(),
      reason: z.string().optional(),
      logistics: z.string().optional(),
      status: z.union([statusEnum.transform(val => [val]), z.array(statusEnum)]).optional(),
      priority: z.union([priorityEnum.transform(val => [val]), z.array(priorityEnum)]).optional(),
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
      if (start === null && end === null) {
        return {
          start: format(new Date(), 'yyyy-MM-dd'),
          end: format(addDays(new Date(), 31), 'yyyy-MM-dd'),
          ...otherProps,
        }
      }

      if (start === null) {
        ctx.addIssue({ code: 'custom', message: 'Enter or select date from', path: ['start'] })
        return z.NEVER
      }

      if (end === null) {
        ctx.addIssue({ code: 'custom', message: 'Enter or select date to', path: ['end'] })
        return z.NEVER
      }

      if (start > end) {
        ctx.addIssue({ code: 'custom', message: 'Enter a valid date range', path: ['end'] })
        ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
        return z.NEVER
      }

      if (differenceInDays(end, start) > 31) {
        ctx.addIssue({ code: 'custom', message: 'Enter a date range less than 31 days', path: ['end'] })
        ctx.addIssue({ code: 'custom', message: '', path: ['start'] })
        return z.NEVER
      }

      return {
        start,
        end,
        ...otherProps,
      }
    })
  }

type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
export type ResQuerySchemaType = SchemaType & { validated?: SchemaType }
