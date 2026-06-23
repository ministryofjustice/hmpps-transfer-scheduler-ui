import { test, expect } from '@playwright/test'
import { stubComponents } from '../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../integration_tests/testUtils'
import { CourtAppearancesHomepage } from './test.page'
import auth from '../../integration_tests/mockApis/hmppsAuth'

test.describe('homepage', () => {
  test.beforeEach(async () => {
    await Promise.all([auth.stubSignInPage(), stubComponents()])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should render homepage for MANAGE role user', async ({ page }) => {
    await login(page, { name: 'A TestUser' })

    const testPage = await new CourtAppearancesHomepage(page).verifyContent()

    await expect(testPage.link('Schedule a transfer')).toHaveAttribute('href', /\/search-prisoner\/schedule-a-transfer/)
    await expect(testPage.link('Plan a transfer')).toBeVisible()
    await expect(testPage.link('Manage scheduled transfers')).toBeVisible()
    await expect(testPage.link('Manage planned transfers')).toBeVisible()
  })

  test('should render homepage for VIEW ONLY role user', async ({ page }) => {
    await login(page, { name: 'A TestUser', roles: ['ROLE_TRANSFER_SCHEDULER_RO'] })

    const testPage = await new CourtAppearancesHomepage(page).verifyContent()

    await expect(testPage.link('Schedule a transfer')).toHaveCount(0)
    await expect(testPage.link('Plan a transfer')).toHaveCount(0)

    await expect(testPage.link('Manage scheduled transfers')).toBeVisible()
    await expect(testPage.link('Manage planned transfers')).toBeVisible()
  })
})
