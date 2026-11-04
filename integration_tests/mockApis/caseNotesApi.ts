import type { SuperAgentRequest } from 'superagent'
import { stubFor, successStub } from './wiremock'

export const stubCaseNotesPing = (httpStatus = 200): SuperAgentRequest =>
  stubFor({
    request: {
      method: 'GET',
      urlPattern: '/case-notes-api/health/ping',
    },
    response: {
      status: httpStatus,
      headers: { 'Content-Type': 'application/json;charset=UTF-8' },
      jsonBody: { status: httpStatus === 200 ? 'UP' : 'DOWN' },
    },
  })

export const stubSearchCaseNotes = () =>
  successStub({
    method: 'POST',
    urlPattern: '/case-notes-api/search/case-notes/([a-zA-Z0-9]*)',
    response: { content: [] },
  })
