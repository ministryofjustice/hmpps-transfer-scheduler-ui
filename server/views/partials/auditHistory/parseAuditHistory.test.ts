import { parseAuditHistory } from './parseAuditHistory'

describe('parseAuditHistory', () => {
  it('can parse audit events', () => {
    const result = parseAuditHistory([
      {
        domainEvents: ['person.transfer.scheduled'],
        occurredAt: '2001-01-01T09:05:00',
        user: { name: 'User Name', username: 'USERNAME' },
        changes: [],
      },
    ])[0]

    expect(result).toBeTruthy()
    expect(result?.heading).toBe('Scheduled')
    expect(result?.content).toBe('Transfer scheduled for <prisoner>')
    expect(result?.user?.name).toBe('User Name')
    expect(result?.user?.username).toBe('USERNAME')
    expect(result?.occurredAt).toBe('2001-01-01T09:05:00')
    expect(result?.changes).toBeUndefined()
  })

  it('can skip user for system generated event', () => {
    const result = parseAuditHistory([
      {
        domainEvents: ['person.transfer.migrated'],
        occurredAt: '2001-01-01T09:05:00',
        user: { name: 'SYSTEM', username: 'SYSTEM' },
        changes: [],
      },
    ])[0]

    expect(result).toBeTruthy()
    expect(result?.heading).toBe('Migrated')
    expect(result?.content).toBe('Transfer migrated from NOMIS')
    expect(result?.user?.name).toBeUndefined()
    expect(result?.user?.username).toBeUndefined()
    expect(result?.occurredAt).toBe('2001-01-01T09:05:00')
    expect(result?.changes).toBeUndefined()
  })

  it('can parse audit event changes', () => {
    const result = parseAuditHistory([
      {
        domainEvents: ['person.transfer.rescheduled'],
        occurredAt: '2001-01-01T09:05:00',
        user: { name: 'User Name', username: 'USERNAME' },
        changes: [{ propertyName: 'start', previous: '2001-01-01T10:00:00', change: '2001-01-02T10:00:00' }],
      },
    ])[0]

    expect(result).toBeTruthy()
    expect(result?.heading).toBe('Rescheduled')
    expect(result?.content).toBeUndefined()
    expect(result?.user?.name).toBe('User Name')
    expect(result?.user?.username).toBe('USERNAME')
    expect(result?.occurredAt).toBe('2001-01-01T09:05:00')
    expect(result?.changes).toContainEqual(
      'Start date and time was changed from 1 January 2001 at 10:00 to 2 January 2001 at 10:00.',
    )
  })

  it('skip unidentified change properties', () => {
    const result = parseAuditHistory([
      {
        domainEvents: ['person.transfer.rescheduled'],
        occurredAt: '2001-01-01T09:05:00',
        user: { name: 'User Name', username: 'USERNAME' },
        changes: [
          { propertyName: 'start', previous: '2001-01-01T10:00:00', change: '2001-01-02T10:00:00' },
          { propertyName: 'end', previous: '2001-01-01T17:00:00', change: '2001-01-02T17:00:00' },
          { propertyName: 'somethingElse', previous: 'lorem ipsum', change: 'dolor sit' },
        ],
      },
    ])[0]

    expect(result).toBeTruthy()
    expect(result?.heading).toBe('Rescheduled')
    expect(result?.content).toBeUndefined()
    expect(result?.user?.name).toBe('User Name')
    expect(result?.user?.username).toBe('USERNAME')
    expect(result?.occurredAt).toBe('2001-01-01T09:05:00')
    expect(result?.changes).toHaveLength(1)
    expect(result?.changes).toContainEqual(
      'Start date and time was changed from 1 January 2001 at 10:00 to 2 January 2001 at 10:00.',
    )
  })
})
