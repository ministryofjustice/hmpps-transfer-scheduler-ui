export interface PrisonerDetails {
  prisonerNumber: string
  lastName: string
  firstName: string
  dateOfBirth: string
  prisonName?: string | undefined
  cellLocation?: string | undefined
  prisonId?: string
}

export type JourneyData = {
  instanceUnixEpoch: number
  prisonerDetails?: PrisonerDetails
  isCheckAnswers?: boolean
  journeyCompleted?: boolean
  b64History?: string | undefined
  stateGuard?: boolean
  scheduleTransfer?: ScheduleTransferJourney
}

type CodedDescription = {
  code: string
  description: string
  hintText?: string
}

type ScheduleTransferJourney = {
  backUrl: string
  historyQuery: string
} & Partial<{
  startDate: string
  startTime: string
  destination: CodedDescription
  reason: CodedDescription
  logistics: CodedDescription
  comments: string | null
  result: components['schemas']['Transfer']
}>
