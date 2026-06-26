import { stubFor, successStub } from './wiremock'

export const stubPrisonRegisterApiHealth = () =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/prison-register-api/health/ping',
    },
    response: {
      status: 200,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: 'UP' },
    },
  })

export const stubGetPrisons = () =>
  successStub({
    method: 'GET',
    urlPattern: '/prison-register-api/prisons',
    response: [
      {
        prisonId: 'P1',
        prisonName: 'Prison One',
      },
      {
        prisonId: 'P2',
        prisonName: 'Prison Two',
      },
    ],
  })
