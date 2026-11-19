import { z } from 'zod'
import { Request, Response } from 'express'
import { isToday } from 'date-fns'
import { $ZodSuperRefineIssue } from 'zod/v4/core'
import { validateAndTransformOptionalCodedDescription } from '../../../../utils/validations/validateCodedDescription'
import { createSchema } from '../../../../middleware/validation/validationMiddleware'
import PrisonRegisterService from '../../../../services/apis/prisonRegisterService'
import TransferSchedulerService from '../../../../services/apis/transferSchedulerService'
import { optionalString } from '../../../../utils/validations/validateString'
import {
  checkTodayOrFuture,
  checkTodayOrPast,
  validateTransformDate,
} from '../../../../utils/validations/validateDatePicker'
import { parseHour, parseMinute } from '../../../../utils/validations/validateTime'

export const schemaFactory =
  (transferSchedulerService: TransferSchedulerService, prisonRegisterService: PrisonRegisterService) =>
  async (_req: Request, res: Response) => {
    const prisons = await prisonRegisterService.getPrisons({ res })
    const reasons = await transferSchedulerService.getReferenceData({ res }, 'transfer-reason')
    const logisticsOptions = await transferSchedulerService.getReferenceData({ res }, 'transfer-logistics')
    const priorityOptions = await transferSchedulerService.getReferenceData({ res }, 'transfer-priority')

    return createSchema({
      requestedOn: z.string().optional(),
      startDate: z.string().optional(),
      startTimeHour: z.string().optional(),
      startTimeMinute: z.string().optional(),
      priority: z
        .string()
        .optional()
        .transform(
          validateAndTransformOptionalCodedDescription(priorityOptions, 'Select the priority of this transfer'),
        )
        .optional(),
      destination: z
        .string()
        .optional()
        .transform(validateAndTransformOptionalCodedDescription(prisons, 'Enter and select a prison'))
        .optional(),
      reason: z
        .string()
        .optional()
        .transform(validateAndTransformOptionalCodedDescription(reasons, 'Enter a reason for this transfer'))
        .optional(),
      logistics: z
        .string()
        .optional()
        .transform(
          validateAndTransformOptionalCodedDescription(
            logisticsOptions,
            'Enter the escort type being used for this transfer',
          ),
        )
        .optional(),
      comments: optionalString(),
    }).transform(
      (
        { requestedOn, startDate, startTimeHour, startTimeMinute, priority, destination, reason, logistics, comments },
        ctx,
      ) => {
        const parsedRequestedOn = validateTransformDate(
          checkTodayOrPast,
          'request date',
          'Request date must be today or in the past',
        ).safeParse(requestedOn)

        const parsedStartDate = validateTransformDate(
          checkTodayOrFuture,
          'transfer date',
          'Transfer date must be today or in the future',
        ).safeParse(startDate)

        const parsedHour = startTimeHour?.length ? parseHour(startTimeHour) : undefined
        const parsedMinute = startTimeMinute?.length ? parseMinute(startTimeMinute) : undefined

        parsedRequestedOn.error?.issues?.forEach(issue =>
          ctx.addIssue({ ...issue, path: ['requestedOn'] } as $ZodSuperRefineIssue),
        )

        if (startDate?.trim() || startTimeHour?.trim() || startTimeMinute?.trim()) {
          parsedStartDate.error?.issues?.forEach(issue =>
            ctx.addIssue({ ...issue, path: ['startDate'] } as $ZodSuperRefineIssue),
          )

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
            }
          }
        }

        if (!priority)
          ctx.addIssue({ code: 'custom', message: 'Select the priority of this transfer', path: ['priority'] })
        if (!reason) ctx.addIssue({ code: 'custom', message: 'Enter and select a reason', path: ['reason'] })

        if (comments && comments.length > 225)
          ctx.addIssue({
            code: 'custom',
            message: 'The maximum character limit for comments is 225',
            path: ['comments'],
          })

        if (ctx.issues.length) {
          return z.NEVER
        }

        return {
          requestedOn: parsedRequestedOn.data!,
          startDate: parsedStartDate.data ?? null,
          startTimeHour: parsedHour?.data ?? null,
          startTimeMinute: parsedMinute?.data ?? null,
          destination: destination ?? null,
          reason: reason!,
          priority: priority!,
          logistics: logistics ?? null,
          comments: comments ?? null,
        }
      },
    )
  }

export type SchemaType = z.infer<Awaited<ReturnType<ReturnType<typeof schemaFactory>>>>
