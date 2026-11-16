import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferConflictsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/schedule-a-transfer/conflicts unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/conflicts')
  })
})

test.describe('/schedule-a-transfer/conflicts', () => {
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
        startDateWithClash: '2001-01-01',
        startTimeWithClash: '10:00',
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
        destinationWithNonAssociation: { code: 'P1', description: 'Prison One' },
        nonAssociations: [
          {
            prisonerNumber: 'Z1111ZZ',
            role: 'VICTIM',
            roleDescription: '',
            firstName: 'ANOTHER-NAME',
            lastName: 'ANOTHER-SURNAME',
          },
        ],
        reason: { code: 'R1', description: 'Reason One' },
        logistics: { code: 'L1', description: 'Logistics One' },
        comments: 'Lorem ipsum',
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/conflicts`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferConflictsPage(page).verifyContent()

    await expect(page.getByText('Date: 1 January 2001')).toBeVisible()
    await expect(page.getByText('Time: 10:00')).toBeVisible()
    await expect(page.getByText('Schedule type: Temporary absence')).toBeVisible()
    await expect(page.getByText('Schedule reason: Police production')).toBeVisible()

    await expect(
      page.getByText('Prisoner-Name Prisoner-Surname has a non-association at Prison One with:'),
    ).toBeVisible()
    await expect(page.getByText('Another-Surname, Another-Name')).toBeVisible()

    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute('href', /transfer-details/)

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/schedule-a-transfer\/check-answers/)
  })
})
