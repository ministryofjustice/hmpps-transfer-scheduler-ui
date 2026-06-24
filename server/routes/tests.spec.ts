import { test, expect } from '@playwright/test'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../integration_tests/testUtils'
import { Homepage } from './test.page'
import auth from '../../integration_tests/mockApis/hmppsAuth'
import { verifyAuditEvents } from '../../integration_tests/steps/verifyAuditEvents'

test.describe('homepage', () => {
  test.beforeEach(async () => {
    await Promise.all([auth.stubSignInPage(), stubComponents()])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render homepage for MANAGE role user', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const testPage = await new Homepage(page).verifyContent()

    await expect(testPage.link('Schedule a transfer')).toHaveAttribute('href', /\/search-prisoner\/schedule-a-transfer/)
    await expect(testPage.link('Plan a transfer')).toBeVisible()
    await expect(testPage.link('Manage scheduled transfers')).toBeVisible()
    await expect(testPage.link('Manage planned transfers')).toBeVisible()

    await verifyAuditEvents([
      {
        what: 'PAGE_VIEW',
        subjectType: 'NOT_APPLICABLE',
        details: expect.stringContaining(`"pageName":"HOMEPAGE","activeCaseLoadId":"LEI"`),
        service: 'hmpps-transfer-scheduler-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })

  test('should render homepage for VIEW ONLY role user', async ({ page }) => {
    await login(page, { name: 'A TestUser', roles: ['ROLE_TRANSFER_SCHEDULER_RO'] })

    const testPage = await new Homepage(page).verifyContent()

    await expect(testPage.link('Schedule a transfer')).toHaveCount(0)
    await expect(testPage.link('Plan a transfer')).toHaveCount(0)

    await expect(testPage.link('Manage scheduled transfers')).toBeVisible()
    await expect(testPage.link('Manage planned transfers')).toBeVisible()
  })
})
