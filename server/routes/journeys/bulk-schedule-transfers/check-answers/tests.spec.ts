import { v4 as uuidV4 } from 'uuid'
import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkScheduleTransfersCheckAnswersPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubPutBulkTransfers } from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { prisoner1 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-schedule-transfers/check-answers unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-schedule-transfers/check-answers')
  })
})

test.describe('/bulk-schedule-transfers/check-answers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubPutBulkTransfers(),
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
        transfers: [
          {
            prisoner: prisoner1,
            startDate: '2001-01-01',
            startTime: '10:00',
            destination: { code: 'P1', description: 'Prison One' },
            reason: { code: 'R1', description: 'Reason One' },
            logistics: { code: 'L1', description: 'Logistics One' },
            comments: 'Lorem ipsum',
          },
        ],
        nonAssociations: [],
      },
    })
    await page.goto(`/${journeyId}/bulk-schedule-transfers/check-answers`)
  }

  test('should try all cases', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new BulkScheduleTransfersCheckAnswersPage(page).verifyContent()
    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '10:00')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Change prisoners in this bulk transfer', /search-prisoners/)

    await testPage.verifyLink('Change date for Name One', /transfer-details\/A1234EA#startDate/)
    await testPage.verifyLink('Change time for Name One', /transfer-details\/A1234EA#startTime/)
    await testPage.verifyLink('Change destination for Name One', /transfer-details\/A1234EA#destination/)
    await testPage.verifyLink('Change reason for Name One', /transfer-details\/A1234EA#reason/)
    await testPage.verifyLink('Change escort details for Name One', /transfer-details\/A1234EA#logistics/)
    await testPage.verifyLink('Change comments for Name One', /transfer-details\/A1234EA#comments/)

    await expect(testPage.button('Confirm and save')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm and save')
    expect(page.url()).toMatch(/\/bulk-schedule-transfers\/confirmation/)
  })
})
