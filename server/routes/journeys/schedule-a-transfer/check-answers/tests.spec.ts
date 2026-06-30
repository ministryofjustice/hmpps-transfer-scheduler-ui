import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferCheckAnswersPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubPostScheduledTransfer } from '../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/schedule-a-transfer/check-answers unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/check-answers')
  })
})

test.describe('/schedule-a-transfer/check-answers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubPostScheduledTransfer(testPrisonerDetails.prisonerNumber),
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
        logistics: { code: 'L1', description: 'Logistics One' },
        comments: 'Lorem ipsum',
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/check-answers`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferCheckAnswersPage(page).verifyContent()
    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '10:00')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Change date', /date-and-time#startDate/)
    await testPage.verifyLink('Change time', /date-and-time#startTime/)
    await testPage.verifyLink('Change destination', /destination/)
    await testPage.verifyLink('Change reason', /reason/)
    await testPage.verifyLink('Change escort details', /logistics/)
    await testPage.verifyLink('Change comments', /comments/)

    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/schedule-a-transfer\/confirmation/)
  })
})
