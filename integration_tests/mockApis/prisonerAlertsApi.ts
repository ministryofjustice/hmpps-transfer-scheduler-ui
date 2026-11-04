import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'

export const stubPrisonAlertsPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prisoner-alerts-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetPrisonerAlerts = () =>
  successStub({
    method: 'GET',
    urlPattern: '/prisoner-alerts-api/prisoners/([a-zA-Z0-9]*)/alerts.*',
    response: { content: [] },
  })
