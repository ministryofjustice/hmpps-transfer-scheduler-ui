import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { PlanTransferPriorityPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPriorities } from '../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/plan-a-transfer/priority unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/plan-a-transfer/priority')
  })
})

test.describe('/plan-a-transfer/priority', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPriorities(),
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
      },
    })
    await page.goto(`/${journeyId}/plan-a-transfer/priority`)
  }

  test('should enter priority for plan-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new PlanTransferPriorityPage(page).verifyContent()

    await expect(testPage.priorityRadio()).toBeVisible()
    await expect(testPage.priorityRadio()).not.toBeChecked()
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Select the priority of this transfer').click()
    await expect(testPage.priorityRadio()).toBeFocused()

    // verify next page routing
    await testPage.priorityRadio().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/plan-a-transfer\/date-and-time/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.priorityRadio()).toBeChecked()
  })
})
