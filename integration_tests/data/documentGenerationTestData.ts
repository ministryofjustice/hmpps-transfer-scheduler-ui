import { components } from '../../server/@types/documentGeneration'

export const testGroups: components['schemas']['TemplateGroups'] = {
  groups: [
    {
      code: 'EXTERNAL_MOVEMENT',
      name: 'External movement templates',
      description:
        'Document templates associated with external movements in general. These require a person to be selected',
      roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
    },
    {
      code: 'TEMPORARY_ABSENCE',
      name: 'Temporary absence templates',
      description:
        'Document templates associated with temporary absences. These require a person and a temporary absence to be selected',
      roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
    },
  ],
}

export const testTemplates: components['schemas']['TemplateGroupTemplates'] = {
  group: {
    code: 'TEMPORARY_ABSENCE',
    name: 'Temporary absence templates',
    description:
      'Document templates associated with temporary absences. These require a person and a temporary absence to be selected',
    roles: ['EXTERNAL_MOVEMENTS_TAP_RO', 'EXTERNAL_MOVEMENTS_TAP_RW'],
  },
  templates: [
    {
      id: 'checklist-template-id',
      code: 'TAP_TXCHKL_V1_1',
      name: 'Transfer Checklist',
      description: '',
      variableDomains: ['PRISON', 'PERSON'],
    },
  ],
}

export const testVariables: components['schemas']['TemplateVariables'] = {
  domains: [
    {
      code: 'PERSON',
      description: 'Prisoner details',
      variables: [
        {
          code: 'perName',
          description: 'Full name',
          type: 'STRING',
        },
      ],
    },
    {
      code: 'TEMPORARY_ABSENCE',
      description: 'Absence information',
      variables: [
        {
          code: 'TEMPORARY_ABSENCE__START_DATE',
          description: 'Temporary absence commences on',
          type: 'STRING',
        },
      ],
    },
  ],
}

export const testTemplateDetail: components['schemas']['TemplateDetail'] = {
  id: 'template-1',
  groups: [testGroups.groups[0]!],
  variables: testVariables,
  code: 'TMPL_1',
  name: 'Test Template',
  description: 'Lorem ipsum',
  instructionText: 'dolor sit',
}
