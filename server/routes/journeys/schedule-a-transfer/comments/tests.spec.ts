import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferCommentsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/schedule-a-transfer/comments unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/comments')
  })
})

test.describe('/schedule-a-transfer/comments', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents(), stubGetPrisonerImage(), stubGetPrisonerDetails()])
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
        logistics: { code: 'L1', description: 'Logistics One' },
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/comments`)
  }

  test('should enter comments for schedule-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferCommentsPage(page).verifyContent()

    await expect(testPage.commentsField()).toBeVisible()
    await expect(testPage.commentsField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickContinue()
    await testPage.link('The maximum character limit is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/schedule-a-transfer\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
  })
})
