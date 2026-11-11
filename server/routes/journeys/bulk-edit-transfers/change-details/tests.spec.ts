import { test, expect, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkEditTransferChangeDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { prisoner1, transfer1, transfer2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-edit-transfers/change-details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/change-details/PRISON_NUMBER')
  })
})

test.describe('/bulk-edit-transfers/change-details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(prisoner1),
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
    await page.goto('/bulk-edit-transfers?start=01/01/2001&end=31/01/2001')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!
    await injectJourneyData(page, journeyId, {
      bulkEditTransfer: {
        transfers: [{ prisoner: transfer1.person }],
        selectedTransfers: [transfer1.person.identifier],
      },
    })
    await page.goto(`/${journeyId}/bulk-edit-transfers/change-details/${transfer1.person.identifier}`)
  }

  test('should enter transfer details and return to check-answers', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransferChangeDetailsPage(page).verifyContent()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickContinue()
    await testPage.link('Enter and select a reason').click()
    await expect(testPage.reasonInput()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/bulk-edit-transfers\/check-answers/)
  })
})
