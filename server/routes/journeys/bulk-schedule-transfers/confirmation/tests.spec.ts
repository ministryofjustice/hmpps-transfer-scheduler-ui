import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkScheduleTransfersConfirmationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails, testTransfer } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/bulk-schedule-transfers/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-schedule-transfers/confirmation')
  })
})

test.describe('/bulk-schedule-transfers/confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents(), stubGetPrisonerImage(), stubGetPrisonerDetails()])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/bulk-schedule-transfers/start/${testPrisonerDetails.prisonerNumber}`)
    await injectJourneyData(page, journeyId, {
      bulkScheduleTransfer: {
        result: { transfers: [testTransfer] },
      },
    })
    await page.goto(`/${journeyId}/bulk-schedule-transfers/confirmation`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new BulkScheduleTransfersConfirmationPage(page).verifyContent()

    await expect(page.getByRole('heading', { name: 'Prisoner-Surname, Prisoner-Name' })).toBeVisible()

    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '09:15')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Create another list of scheduled transfers', /bulk-schedule-transfers/)
    await testPage.verifyLink('View and manage scheduled transfers', /scheduled-transfers/)
    await testPage.verifyLink('View and manage planned transfers', /planned-transfers/)
    await testPage.verifyLink('Return to Transfers homepage', '/')
  })
})
