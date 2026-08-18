import { formatDate } from '../../../utils/dateTimeUtils'
import { components } from '../../../@types/transferSchedulerApi'
import { CodedDescription } from '../../../@types/journeys'

type DomainEventText = {
  heading: string
  content?: string
  reasonRequested?: boolean
  changes?: string[]
  skipUser?: boolean
}
type ReferenceData = { prisons: CodedDescription[] }

const DOMAIN_EVENT_MAP: { [key: string]: DomainEventText } = {
  'person.transfer.migrated': {
    heading: 'Migrated',
    content: 'Transfer migrated from NOMIS',
    skipUser: true,
  },
  'person.transfer.planned': {
    heading: 'Planned',
    content: 'Transfer planned for <prisoner>',
  },
  'person.transfer.scheduled': {
    heading: 'Scheduled',
    content: 'Transfer scheduled for <prisoner>',
  },
  'person.transfer.cancelled': {
    heading: 'Cancelled',
    content: 'Transfer for <prisoner> cancelled',
    reasonRequested: true,
  },
  'person.transfer.moved-to-planning': {
    heading: 'Moved to planning',
    content: 'Transfer moved to the planning stage for <prisoner>',
  },
  'person.transfer.expired': {
    heading: 'Expired',
    content: 'Transfer for <prisoner> has expired',
    skipUser: true,
  },
  'person.transfer.in-transit': {
    heading: 'In transit',
    content: '<prisoner> is in transit',
  },
  'person.transfer.completed': {
    heading: 'Completed',
    content: 'Transfer completed for <prisoner>',
    skipUser: true,
  },
  'person.transfer.rescheduled': {
    heading: 'Rescheduled',
  },
  'person.transfer.relocated': {
    heading: 'Destination changed',
  },
  'person.transfer.recategorised': {
    heading: 'Reason changed',
  },
  'person.transfer.logistics-changed': {
    heading: 'Logistics changed',
  },
  'person.transfer.reprioritised': {
    heading: 'Priority changed',
  },
  'person.transfer.planning-comments-changed': {
    heading: 'Planning comments changed',
  },
  'person.transfer.schedule-comments-changed': {
    heading: 'Schedule comments changed',
  },

  'person.transfer-movement.migrated': {
    heading: 'Migrated',
    content: 'Transfer movement migrated from NOMIS',
    skipUser: true,
  },
  'person.transfer-movement.recorded': {
    heading: 'Recorded',
    content: 'Transfer movement recorded for <prisoner>',
  },
  'person.transfer-movement.deleted': {
    heading: 'Deleted',
    content: 'Transfer movement deleted',
    skipUser: true,
  },
  'person.transfer-movement.occurred-at-changed': {
    heading: 'Happened at changed',
  },
  'person.transfer-movement.relocated': {
    heading: 'Destination changed',
  },
  'person.transfer-movement.recategorised': {
    heading: 'Reason changed',
  },
  'person.transfer-movement.logistics-changed': {
    heading: 'Logistics changed',
  },
  'person.transfer-movement.comments-changed': {
    heading: 'Comments changed',
  },
}

const CHANGE_PROPERTY_MAP: { [key: string]: string } = {
  start: 'Start date and time',
  reason: 'Reason',
  comments: 'Comments',
  destinationCode: 'Destination',
  logistics: 'Escort details',
}

const parseChangedPropertyValue = (domain: string, property: string, value: unknown, referenceData: ReferenceData) => {
  if (!value) return 'Not applicable'

  if (property === 'prisonCode' || property === 'destinationCode') {
    const prison = referenceData.prisons.find(({ code }) => code === value)
    if (prison) return `“${prison.description}”`
    return `unknown prison code “${value}”`
  }

  if (domain.endsWith('comments-changed') && property === 'comments') return `“${value}”`

  if (domain.endsWith('date-range-changed') && ['start', 'end'].includes(property)) return formatDate(String(value))

  if (domain.endsWith('rescheduled') && ['start', 'end'].includes(property))
    return formatDate(String(value), `d MMMM yyyy 'at' HH:mm`)

  return String(value)
}

export const parseAuditHistory = (
  history: components['schemas']['AuditedAction'][],
  referenceData: ReferenceData = { prisons: [] },
) =>
  history
    .flatMap(action =>
      action.domainEvents.map(event => {
        const eventText = DOMAIN_EVENT_MAP[event]
        if (!eventText) return null

        const changes = !eventText.content
          ? action.changes
              .filter(({ propertyName }) => CHANGE_PROPERTY_MAP[propertyName])
              .map(change => {
                return `${CHANGE_PROPERTY_MAP[change.propertyName] ?? change.propertyName} ${change.propertyName === 'comments' ? 'were' : 'was'} changed from ${parseChangedPropertyValue(event, change.propertyName, change.previous, referenceData)} to ${parseChangedPropertyValue(event, change.propertyName, change.change, referenceData)}.`
              })
              .filter(itm => Boolean(itm))
          : null
        return {
          ...eventText,
          reason: action.reason,
          user: eventText.skipUser ? null : action.user,
          occurredAt: action.occurredAt,
          ...(changes ? { changes } : {}),
        }
      }),
    )
    .filter(itm => Boolean(itm))
