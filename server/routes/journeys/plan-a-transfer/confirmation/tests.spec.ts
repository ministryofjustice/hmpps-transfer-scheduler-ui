import { v4 as uuidV4 } from 'uuid'
import { test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { PlanTransferConfirmationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'

test.describe('/plan-a-transfer/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/plan-a-transfer/confirmation')
  })
})

test.describe('/plan-a-transfer/confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents(), stubGetPrisonerImage(), stubGetPrisonerDetails()])
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
        result: {
          id: 'transfer-id',
          destination: { code: 'P1', name: 'Prison One' },
          logistics: { code: 'L1', description: 'Logistics One' },
          person: {
            identifier: testPrisonerDetails.prisonerNumber,
            firstName: 'PRISONER-NAME',
            lastName: 'PRISONER-SURNAME',
          },
          prison: { code: 'LEI', name: 'Leeds' },
          reason: { code: 'R1', description: 'Reason One' },
          schedule: { start: '2001-01-01T09:15:00', comments: 'Lorem ipsum' },
          plan: { requestedOn: '2001-01-01', priority: { code: '1', description: 'High' } },
          status: { code: 'READY_TO_SCHEDULE', description: 'Ready to scheduled' },
          stage: 'PLANNING',
        },
      },
    })
    await page.goto(`/${journeyId}/plan-a-transfer/confirmation`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new PlanTransferConfirmationPage(page).verifyContent()

    await testPage.verifyAnswer('Request received', '1 January 2001')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Priority', 'High')
    await testPage.verifyAnswer('Date and time', '1 January 2001 at 09:15')
    await testPage.verifyAnswer('Destination (optional)', 'Prison One')
    await testPage.verifyAnswer('Escort details (optional)', 'Logistics One')
    await testPage.verifyAnswer('Comments (optional)', 'Lorem ipsum')

    await testPage.verifyLink('View and manage this planned transfer', /transfers\/transfer-id/)
    await testPage.verifyLink('View and manage transfers', /scheduled-transfers/)
    await testPage.verifyLink('View and manage planned transfers', /planned-transfers/)
    await testPage.verifyLink('Return to the DPS homepage', /localhost:3001$/)
  })
})
