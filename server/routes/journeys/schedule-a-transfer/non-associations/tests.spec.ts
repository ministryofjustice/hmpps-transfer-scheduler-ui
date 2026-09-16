import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferNonAssociationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/schedule-a-transfer/non-associations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/non-associations')
  })
})

test.describe('/schedule-a-transfer/non-associations', () => {
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
      },
    })
    await page.goto(`/${journeyId}/schedule-a-transfer/non-associations`)
  }

  test('should continue to schedule-a-transfer with a non-association', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferNonAssociationPage(page).verifyContent()

    await expect(testPage.link('Go back')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute('href', /destination/)
    await expect(testPage.button('Continue')).toBeVisible()

    await expect(
      page.getByText('Prisoner-Name Prisoner-Surname has a non-association at Prison One with:'),
    ).toBeVisible()
    await expect(page.getByText('Another-Surname, Another-Name')).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/schedule-a-transfer\/reason/)
  })
})
