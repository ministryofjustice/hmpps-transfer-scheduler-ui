import { Page } from '@playwright/test'
import tokenVerification from './mockApis/tokenVerification'
import hmppsAuth, { type UserToken } from './mockApis/hmppsAuth'
import { resetStubs, stubFor } from './mockApis/wiremock'

export { resetStubs }

const DEFAULT_ROLES = ['ROLE_TRANSFER_SCHEDULER_RW']

export const attemptHmppsAuthLogin = async (page: Page) => {
  await page.goto('/')
  page.locator('h1', { hasText: 'Sign in' })
  const url = await hmppsAuth.getSignInUrl()
  await page.goto(url)
}

const stubAuditSqs = () =>
  stubFor({
    request: {
      method: 'POST',
      url: '/',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
      body: '{ }',
    },
  })

export const login = async (
  page: Page,
  {
    name = 'User Name',
    roles = DEFAULT_ROLES,
    active = true,
    authSource = 'nomis',
  }: UserToken & { active?: boolean } = {},
) => {
  await Promise.all([
    hmppsAuth.favicon(),
    hmppsAuth.stubSignInPage(),
    hmppsAuth.stubSignOutPage(),
    hmppsAuth.token({ name, roles, authSource }),
    tokenVerification.stubVerifyToken(active),
    stubAuditSqs(),
  ])
  await attemptHmppsAuthLogin(page)
}
