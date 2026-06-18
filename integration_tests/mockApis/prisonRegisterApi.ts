import { stubFor } from './wiremock'

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
