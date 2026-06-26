import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferDestinationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/schedule-a-transfer/destination unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/destination')
  })
})

test.describe('/schedule-a-transfer/destination', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/schedule-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)
    await injectJourneyData(page, journeyId, {
      scheduleTransfer: {
        backUrl: 'back-url',
        historyQuery: 'history',
        startDate: '2001-01-01',
        startTime: '10:00',
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/destination`)
  }

  test('should enter destination for schedule-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select a prison').click()
    await expect(testPage.destinationInput()).toBeFocused()

    // verify next page routing
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/schedule-a-transfer\/reason/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
  })
})
