import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferClashesPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/schedule-a-transfer/clashes unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/clashes')
  })
})

test.describe('/schedule-a-transfer/clashes', () => {
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
        clashes: [
          {
            start: '2001-01-01T10:00:00',
            end: '2001-01-01T17:00:00',
            description: {
              full: 'Police production',
              short: '',
            },
            location: {
              description: '',
            },
            additionalInformation: {
              prisonCode: '',
            },
            type: 'Temporary absence',
          },
        ],
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/clashes`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferClashesPage(page).verifyContent()

    await expect(page.getByText('Date: 1 January 2001')).toBeVisible()
    await expect(page.getByText('Time: 10:00')).toBeVisible()
    await expect(page.getByText('Schedule type: Temporary absence')).toBeVisible()
    await expect(page.getByText('Schedule reason: Police production')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute('href', /date-and-time/)

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/schedule-a-transfer\/destination/)
  })
})
