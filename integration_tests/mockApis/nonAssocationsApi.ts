import { stubFor, successStub } from './wiremock'
import { PrisonerNonAssociations } from '../../server/@types/nonAssociations'

export const stubNonAssociationsPing = (httpStatus = 200) =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/non-associations-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetNonAssociations = (response: PrisonerNonAssociations) =>
  successStub({
    method: 'GET',
    urlPattern: '/non-associations-api/prisoner/([a-zA-Z0-9]*)/non-associations.*',
    response,
  })
