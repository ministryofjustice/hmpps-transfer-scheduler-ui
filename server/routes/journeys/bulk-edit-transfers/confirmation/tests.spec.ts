import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { BulkEditTransfersConfirmationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer, transfer1, transfer2 } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/bulk-edit-transfers/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/confirmation')
  })
})

test.describe('/bulk-edit-transfers/confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page) => {
    await page.goto('/bulk-edit-transfers')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!
    await injectJourneyData(page, journeyId, {
      bulkEditTransfer: {
        startDate: '2001-01-01',
        startTime: '10:00',
        destination: { code: 'P1', description: 'Prison One' },
        reason: { code: 'R1', description: 'Reason One' },
        logistics: { code: 'L1', description: 'Logistics One' },
        comments: 'Lorem ipsum',
        transfers: [],
        result: { transfers: [testTransfer] },
      },
    })
    await page.goto(`/${journeyId}/bulk-edit-transfers/confirmation`)
  }

  test('should try all cases', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransfersConfirmationPage(page).verifyContent()

    await expect(page.getByText('Prisoner-Surname, Prisoner-Name')).toBeVisible()

    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '10:00')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')

    await testPage.verifyLink('Create and edit another list of scheduled transfers', /bulk-edit-transfers/)
    await testPage.verifyLink('View and manage scheduled transfers', /scheduled-transfers/)
    await testPage.verifyLink('View and manage planned transfers', /planned-transfers/)
    await testPage.verifyLink('Return to Transfers homepage', '/')
  })
})
