import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisons } from '../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetReasons,
  stubGetLogistics,
  stubSearchTransfers,
} from '../../../integration_tests/mockApis/transferSchedulerApi'
import { login } from '../../../integration_tests/testUtils'
import { resetStubs } from '../../../integration_tests/mockApis/wiremock'
import { BulkEditTransfersSearchTransfersPage } from './test.page'

test.describe('/bulk-edit-transfers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubSearchTransfers({
        metadata: { totalElements: 11 },
        content: [
          {
            id: 'transfer-1',
            person: {
              identifier: 'A9965EA',
              firstName: 'PRISONER-NAME',
              lastName: 'PRISONER-SURNAME',
            },
            prison: {
              code: 'LEI',
              name: 'LEEDS',
            },
            status: { code: 'SCHEDULED', description: 'Scheduled' },
            schedule: {
              start: '2001-01-01T10:00:00',
            },
            destination: { code: 'P1', name: 'Prison One' },
            reason: { code: 'R1', description: 'Reason One' },
            logistics: { code: 'L1', description: 'Logistics One' },
            stage: 'SCHEDULED',
          },
        ],
      }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should create bulk edit transfers list', async ({ page }) => {
    await page.goto('/bulk-edit-transfers?start=01/01/2001&end=31/01/2001&page=2')

    // verify page content
    const testPage = await new BulkEditTransfersSearchTransfersPage(page).verifyContent()

    await expect(testPage.startDateField()).toBeVisible()
    await expect(testPage.startDateField()).toHaveValue('1/1/2001')
    await expect(testPage.endDateField()).toBeVisible()
    await expect(testPage.endDateField()).toHaveValue('31/1/2001')
    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('')
    await expect(testPage.reasonInput()).toBeVisible()
    await expect(testPage.reasonInput()).toHaveValue('')
    await expect(testPage.logisticsInput()).toBeVisible()
    await expect(testPage.logisticsInput()).toHaveValue('')

    await expect(page.getByText('Prisoner-Name Prisoner-Surname - A9965EA')).toBeVisible()
    await expect(page.locator('strong', { hasText: 'Destination' }).locator('..')).toContainText('Prison One')
    await expect(page.locator('strong', { hasText: 'Date' }).locator('..')).toContainText('1 January 2001')
    await expect(page.locator('strong', { hasText: 'Time' }).locator('..')).toContainText('10:00')
    await expect(page.locator('strong', { hasText: 'Reason' }).locator('..')).toContainText('Reason One')
    await expect(page.locator('strong', { hasText: 'Escort details' }).locator('..')).toContainText('Logistics One')

    // verify validation error
    await testPage.endDateField().fill('2/2/2001')
    await testPage.clickButton('Apply')
    await testPage.link('Enter a date range less than 31 days').click()
    await expect(testPage.endDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view scheduled transfers.')).toBeVisible()

    // verify next page routing
    await testPage.endDateField().fill('31/1/2001')
    await testPage.clickButton('Apply')
    await testPage.clickButton('Create list')

    expect(page.url()).toMatch(/\/bulk-edit-transfers\/edit-list/)
  })
})
