import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { PlanTransferDestinationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/plan-a-transfer/destination unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/plan-a-transfer/destination')
  })
})

test.describe('/plan-a-transfer/destination', () => {
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
    await page.goto(`/${journeyId}/plan-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)
    await injectJourneyData(page, journeyId, {
      planTransfer: {
        backUrl: 'back-url',
        historyQuery: 'history',
        requestedOn: '2001-01-01',
        reason: { code: 'R1', description: 'Reason One' },
        priority: { code: '1', description: 'High' },
        startDate: '2001-01-01',
        startTime: '10:00',
      },
    })
    await page.goto(`/${journeyId}/plan-a-transfer/destination`)
  }

  test('should enter destination for plan-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new PlanTransferDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify next page routing
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/plan-a-transfer\/logistics/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
  })

  test('should allow skip entering destination for plan-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new PlanTransferDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/plan-a-transfer\/logistics/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.destinationInput()).toHaveValue('')
  })
})
