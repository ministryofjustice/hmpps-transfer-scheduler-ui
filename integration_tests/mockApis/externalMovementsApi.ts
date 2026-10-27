import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'
import { testPrisonerDetails } from '../data/testData'
import { components } from '../../server/@types/transferSchedulerApi'

export const stubExternalMovementsPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/external-movements-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetTemporaryAbsenceClashes = (
  clashes: components['schemas']['ClashResponse']['data'][0]['clashes'][0][],
) =>
  successStub({
    method: 'POST',
    urlPattern: '/external-movements-api/search/people/clashes',
    response: {
      origin: { productId: '', name: '' },
      data: [{ personIdentifier: { type: 'PRISON_NUMBER', value: testPrisonerDetails.prisonerNumber }, clashes }],
    },
  })
