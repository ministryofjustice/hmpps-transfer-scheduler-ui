import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisons } from '../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetReasons,
  stubGetLogistics,
  stubSearchTransfers,
  stubGetPriorities,
} from '../../../integration_tests/mockApis/transferSchedulerApi'
import { login } from '../../../integration_tests/testUtils'
import { resetStubs } from '../../../integration_tests/mockApis/wiremock'
import { BrowsePlannedTransfersPage } from './test.page'
import { verifyAuditEvents } from '../../../integration_tests/steps/verifyAuditEvents'

test.describe('/scheduled-transfers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubGetPriorities(),
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
            stage: 'PLANNING',
            plan: { requestedOn: '1999-12-31', priority: { code: '1', description: 'High' } },
          },
        ],
      }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should show search transfers page', async ({ page }) => {
    await page.goto('/planned-transfers?searchTerm=test&requestStart=01/01/2001&requestEnd=31/01/2001&page=2')

    const testPage = await new BrowsePlannedTransfersPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('test')
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
    await expect(page.locator('strong', { hasText: 'Priority' }).locator('..')).toContainText('High')
    await expect(testPage.link('View details')).toHaveAttribute('href', /\/transfers\/transfer-1/)

    await testPage.endDateField().fill('2/2/2001')
    await testPage.clickButton('Apply')
    await testPage.link('Enter a date range less than 31 days').click()
    await expect(testPage.endDateField()).toBeFocused()
    await expect(page.getByText('Enter a valid filter to search and view planned transfers.')).toBeVisible()

    await verifyAuditEvents([
      {
        what: 'PAGE_VIEW',
        subjectType: 'SEARCH_TERM',
        subjectId: 'test',
        details: expect.stringContaining(
          `"pageName":"BROWSE_PLANNED_TRANSFERS","query":"test","activeCaseLoadId":"LEI"`,
        ),
        service: 'hmpps-transfer-scheduler-ui',
        who: 'USER1',
        correlationId: expect.any(String),
        when: expect.any(String),
      },
    ])
  })
})
