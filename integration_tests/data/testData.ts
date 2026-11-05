import { components } from '../../server/@types/transferSchedulerApi'
import { PrisonerNonAssociations } from '../../server/@types/nonAssociations'

export const testPrisonerDetails = {
  prisonerNumber: 'A9965EA',
  bookingId: '1223167',
  bookNumber: '59862A',
  firstName: 'PRISONER-NAME',
  lastName: 'PRISONER-SURNAME',
  dateOfBirth: '1990-01-01',
  gender: 'Male',
  youthOffender: false,
  status: 'ACTIVE IN',
  lastMovementTypeCode: 'ADM',
  lastMovementReasonCode: '24',
  inOutStatus: 'IN',
  prisonId: 'LEI',
  lastPrisonId: 'LEI',
  prisonName: 'Leeds (HMP)',
  cellLocation: '2-1-005',
  aliases: [],
  alerts: [
    {
      alertType: 'L',
      alertCode: 'LCE',
      active: true,
      expired: false,
    },
  ],
  legalStatus: 'REMAND',
  imprisonmentStatus: 'RECEP_REM',
  imprisonmentStatusDescription: 'On remand (reception)',
  convictedStatus: 'Remand',
  recall: false,
  indeterminateSentence: false,
  receptionDate: '2024-11-26',
  locationDescription: 'Leeds (HMP)',
  restrictedPatient: false,
  currentIncentive: {
    level: {
      code: 'STD',
      description: 'Standard',
    },
    dateTime: '2024-11-26T14:12:29',
    nextReviewDate: '2025-02-26',
  },
  addresses: [],
  emailAddresses: [],
  phoneNumbers: [],
  identifiers: [],
  allConvictedOffences: [],
}

export const testTransfer: components['schemas']['Transfer'] = {
  id: 'transfer-id',
  destination: { code: 'P1', name: 'Prison One' },
  logistics: { code: 'L1', description: 'Logistics One' },
  person: { identifier: testPrisonerDetails.prisonerNumber, firstName: 'PRISONER-NAME', lastName: 'PRISONER-SURNAME' },
  prison: { code: 'LEI', name: 'Leeds' },
  reason: { code: 'R1', description: 'Reason One' },
  schedule: { start: '2001-01-01T09:15:00', comments: 'Lorem ipsum' },
  status: { code: 'SCHEDULED', description: 'Scheduled' },
  stage: 'SCHEDULED',
}

export const testNonAssociationResponse: PrisonerNonAssociations = {
  closedCount: '',
  firstName: '',
  lastName: '',
  nonAssociations: [
    {
      id: 0,
      role: 'VICTIM',
      roleDescription: '',
      reason: 'BULLYING',
      reasonDescription: '',
      restrictionType: 'CELL',
      restrictionTypeDescription: '',
      comment: '',
      authorisedBy: '',
      whenCreated: '',
      whenUpdated: '',
      updatedBy: '',
      isClosed: false,
      otherPrisonerDetails: {
        prisonerNumber: '',
        role: 'VICTIM',
        roleDescription: '',
        firstName: 'Non',
        lastName: 'Association',
        prisonId: 'P1',
        prisonName: 'Prison One',
        cellLocation: '',
      },
      isOpen: true,
    },
  ],
  openCount: '',
  prisonerNumber: '',
}

export const prisoner1 = {
  prisonerNumber: 'A1234EA',
  firstName: 'Name',
  lastName: 'One',
  cellLocation: 'Loc-1',
  prisonId: 'LEI',
  dateOfBirth: '',
  status: '',
  prisonName: '',
  restrictedPatient: false,
}

export const prisoner2 = {
  prisonerNumber: 'A2345EA',
  firstName: 'Another',
  lastName: 'Two',
  cellLocation: 'Loc-2',
  prisonId: 'LEI',
  dateOfBirth: '',
  status: '',
  prisonName: '',
  restrictedPatient: false,
}

export const transfer1 = {
  id: 'transfer-1',
  person: {
    identifier: 'A1234EA',
    firstName: 'Name',
    lastName: 'One',
  },
  prison: {
    code: 'LEI',
    name: 'LEEDS',
  },
  status: { code: 'SCHEDULED', description: 'Scheduled' },
  schedule: {
    start: '2001-01-01T10:00:00',
  },
  destination: { code: 'P1', name: 'Prison One' },
  reason: { code: 'R1', description: 'Reason One' },
  logistics: { code: 'L1', description: 'Logistics One' },
  stage: 'SCHEDULED' as 'SCHEDULED' | 'PLANNING' | 'UNSCHEDULED',
}

export const transfer2 = {
  id: 'transfer-2',
  person: {
    identifier: 'A2345EA',
    firstName: 'Another',
    lastName: 'Two',
  },
  prison: {
    code: 'LEI',
    name: 'LEEDS',
  },
  status: { code: 'SCHEDULED', description: 'Scheduled' },
  schedule: {
    start: '2001-01-01T10:00:00',
  },
  destination: { code: 'P1', name: 'Prison One' },
  reason: { code: 'R1', description: 'Reason One' },
  logistics: { code: 'L1', description: 'Logistics One' },
  stage: 'SCHEDULED' as 'SCHEDULED' | 'PLANNING' | 'UNSCHEDULED',
}
