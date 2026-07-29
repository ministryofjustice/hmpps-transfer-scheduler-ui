import { v4 as uuidV4 } from 'uuid'
import { test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { MoveTransferToPlanningConfirmationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { stubGetTransfer } from '../../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/transfers/move-to-planning/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/move-to-planning/confirmation')
  })
})

test.describe('/transfers/move-to-planning/confirmation', () => {
  const transferId = uuidV4()

  const transfer = {
    ...testTransfer,
    id: transferId,
  }

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetTransfer(transfer),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/transfers/start-move-to-planning/${transferId}`)
    await injectJourneyData(page, journeyId, {
      moveTransferToPlanning: {
        backUrl: 'back-url',
        historyQuery: 'history',
        transfer,
        requestedOn: '2001-01-01',
        priority: { code: '1', description: 'High' },
        result: {
          ...transfer,
          status: { code: 'READY_TO_SCHEDULE', description: 'Ready to schedule' },
          plan: { requestedOn: '2001-01-01', priority: { code: '1', description: 'High' } },
        },
      },
    })
    await page.goto(`/${journeyId}/transfers/move-to-planning/confirmation`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new MoveTransferToPlanningConfirmationPage(page).verifyContent()

    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '09:15')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')

    await testPage.verifyAnswer('Request received', '1 January 2001')
    await testPage.verifyAnswer('Priority', 'High')

    await testPage.verifyLink('Back to Transfers homepage', '/')
    await testPage.verifyLink('View planned transfers', /planned-transfers/)
    await testPage.verifyLink('Return to the DPS homepage', /localhost:3001$/)
  })
})
