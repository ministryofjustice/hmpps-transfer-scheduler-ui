import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'

export const stubTransferSchedulerPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/transfer-scheduler-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubGetReasons = () =>
  successStub({
    method: 'GET',
    urlPattern: '/transfer-scheduler-api/reference-data/transfer-reason',
    response: {
      items: [
        {
          code: 'R1',
          description: 'Reason One',
        },
        {
          code: 'R2',
          description: 'Reason Two',
        },
      ],
    },
  })
