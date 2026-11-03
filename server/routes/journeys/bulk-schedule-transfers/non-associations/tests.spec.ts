import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkScheduleTransfersNonAssociationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import { prisoner1, prisoner2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-schedule-transfers/non-associations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-schedule-transfers/non-associations')
  })
})

test.describe('/bulk-schedule-transfers/non-associations', () => {
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
    await page.goto(`/${journeyId}/bulk-schedule-transfers`)
    await injectJourneyData(page, journeyId, {
      bulkScheduleTransfer: {
        transfers: [{ prisoner: prisoner1 }, { prisoner: prisoner2 }],
        nonAssociations: [
          {
            prisoner: prisoner1,
            destination: 'Prison One',
            otherPrisoners: [
              {
                prisonerNumber: 'Z1111ZZ',
                role: 'VICTIM',
                roleDescription: '',
                firstName: 'ANOTHER-NAME',
                lastName: 'ANOTHER-SURNAME',
              },
            ],
          },
        ],
      },
    })
    await page.goto(`/${journeyId}/bulk-schedule-transfers/non-associations`)
  }

  test('should show non-association for bulk-schedule-transfers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new BulkScheduleTransfersNonAssociationPage(page).verifyContent()

    await expect(testPage.link('Edit list of prisoners')).toBeVisible()
    await expect(testPage.link('Edit list of prisoners')).toHaveAttribute('href', /search-prisoners/)
    await expect(testPage.button('Continue')).toBeVisible()

    await expect(page.getByText('Name One has a non-association at Prison One with:')).toBeVisible()
    await expect(page.getByText('Another-Surname, Another-Name')).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/bulk-schedule-transfers\/check-answers/)
  })
})
