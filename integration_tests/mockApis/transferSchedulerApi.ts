import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'
import { components } from '../../server/@types/transferSchedulerApi'
import { testTransfer } from '../data/testData'

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

export const stubGetLogistics = () =>
  successStub({
    method: 'GET',
    urlPattern: '/transfer-scheduler-api/reference-data/transfer-logistics',
    response: {
      items: [
        {
          code: 'L1',
          description: 'Logistics One',
        },
        {
          code: 'L2',
          description: 'Logistics Two',
        },
      ],
    },
  })

export const stubPostScheduledTransfer = (
  prisonNumber: string,
  result: components['schemas']['Transfer'] = testTransfer,
) =>
  successStub({
    method: 'POST',
    urlPattern: `/transfer-scheduler-api/transfers/${prisonNumber}`,
    response: result,
  })
