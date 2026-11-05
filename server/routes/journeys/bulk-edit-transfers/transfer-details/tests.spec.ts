import { test, expect, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkEditTransferDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { testPrisonerDetails, transfer1, transfer2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-edit-transfers/transfer-details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/transfer-details/PRISON_NUMBER')
  })
})

test.describe('/bulk-edit-transfers/transfer-details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(testPrisonerDetails),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page) => {
    await page.goto('/bulk-edit-transfers')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!
    await injectJourneyData(page, journeyId, {
      bulkEditTransfer: {
        transfers: [{ prisoner: transfer1.person }],
        prisonerToAdd: {
          identifier: testPrisonerDetails.prisonerNumber,
          firstName: testPrisonerDetails.firstName,
          lastName: testPrisonerDetails.lastName,
        },
      },
    })
    await page.goto(`/${journeyId}/bulk-edit-transfers/transfer-details/${testPrisonerDetails.prisonerNumber}`)
  }

  test('should enter transfer details and return to edit-list', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransferDetailsPage(page).verifyContent()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickContinue()
    await testPage.link('Enter or select a transfer date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a transfer time').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Enter and select a prison').click()
    await expect(testPage.destinationInput()).toBeFocused()
    await testPage.link('Enter and select a reason').click()
    await expect(testPage.reasonInput()).toBeFocused()
    await testPage.link('Enter and select an escort type').click()
    await expect(testPage.logisticsInput()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/bulk-edit-transfers\/edit-list/)
  })
})
