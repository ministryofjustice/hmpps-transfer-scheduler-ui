import { test, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails, stubSearchPrisoner } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkScheduleTransferSearchPrisonerPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { prisoner1, prisoner2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-schedule-transfers/search-prisoners unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-schedule-transfers/search-prisoners')
  })
})

test.describe('/bulk-schedule-transfers/search-prisoners', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubSearchPrisoner('LEI', '.+', {
        content: [prisoner1, prisoner2],
      }),
      stubGetPrisonerDetails(prisoner1),
      stubGetPrisonerDetails(prisoner2),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should try all cases', async ({ page }) => {
    await page.goto('/bulk-schedule-transfers')

    // verify page content
    const testPage = await new BulkScheduleTransferSearchPrisonerPage(page).verifyContent()

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

    await testPage.verifyTableRow(1, ['One, Name', 'A1234EA', 'Loc-1'])
    await testPage.verifyTableRow(2, ['Two, Another', 'A2345EA', 'Loc-2'])

    // select prisoners
    await testPage.clickLink('Add to bulk list (One, Name)')
    await testPage.clickLink('Add to bulk list (Two, Another)')

    // remove prisoner
    await testPage.clickLink('Remove from bulk list (Two, Another)')

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/bulk-schedule-transfers\/transfer-details/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.link('Remove One, Name')).toBeVisible()
    await expect(testPage.link('Remove Two, Another')).toHaveCount(0)
  })
})
