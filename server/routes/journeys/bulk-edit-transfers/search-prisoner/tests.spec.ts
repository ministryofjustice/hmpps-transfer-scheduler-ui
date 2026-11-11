import { test, expect, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails, stubSearchPrisoner } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { BulkEditTransferSearchPrisonerPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { prisoner1, testPrisonerDetails, transfer1, transfer2 } from '../../../../../integration_tests/data/testData'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/bulk-edit-transfers/search-prisoners unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/search-prisoners')
  })
})

test.describe('/bulk-edit-transfers/search-prisoners', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubSearchPrisoner('LEI', '.+', {
        content: [prisoner1, testPrisonerDetails],
      }),
      stubGetPrisonerDetails(testPrisonerDetails),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page) => {
    await page.goto('/bulk-edit-transfers?start=01/01/2001&end=31/01/2001')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!
    await injectJourneyData(page, journeyId, {
      bulkScheduleTransfer: {
        transfers: [
          {
            prisoner: prisoner1,
            startDate: '2001-01-01',
            startTime: '10:00',
            destination: { code: 'P1', description: 'Prison One' },
            reason: { code: 'R1', description: 'Reason One' },
            logistics: { code: 'L1', description: 'Logistics One' },
            comments: 'Lorem ipsum',
          },
        ],
        nonAssociations: [],
      },
    })
    await page.goto(`/${journeyId}/bulk-edit-transfers/search-prisoner`)
  }

  test('should try all cases', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransferSearchPrisonerPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')
    await expect(testPage.button('Search')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Search')
    await testPage.link('Enter a name or prison number').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify successful search
    await testPage.searchField().fill('test')
    await testPage.clickButton('Search')

    await testPage.verifyTableRow(1, ['One, Name', 'A1234EA', 'Loc-1', 'Already in list'])
    await testPage.verifyTableRow(2, ['Prisoner-Surname, Prisoner-Name', 'A9965EA', '2-1-005', 'Add to list'])

    await expect(testPage.link('Add to list (One, Name)')).toHaveCount(0)

    // verify next page routing
    await testPage.clickLink('Add to list (Prisoner-Surname, Prisoner-Name)')
    expect(page.url()).toMatch(/\/bulk-edit-transfers\/transfer-details/)
  })
})
