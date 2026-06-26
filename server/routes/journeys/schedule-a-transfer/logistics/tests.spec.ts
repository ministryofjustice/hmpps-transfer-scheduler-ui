import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferLogisticsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetLogistics } from '../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/schedule-a-transfer/logistics unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/logistics')
  })
})

test.describe('/schedule-a-transfer/logistics', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetLogistics(),
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
        destination: { code: 'P1', description: 'Prison One' },
        reason: { code: 'R1', description: 'Reason One' },
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/logistics`)
  }

  test('should enter logistics for schedule-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferLogisticsPage(page).verifyContent()

    await expect(testPage.logisticsInput()).toBeVisible()
    await expect(testPage.logisticsInput()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select an escort type').click()
    await expect(testPage.logisticsInput()).toBeFocused()

    // verify next page routing
    await testPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/schedule-a-transfer\/comments/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
  })
})
