import { test, Page, expect } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { BulkEditTransfersCheckAnswersPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import {
  stubGetLogistics,
  stubGetReasons,
  stubPutBulkTransfers,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { transfer1, transfer2 } from '../../../../../integration_tests/data/testData'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/bulk-edit-transfers/check-answers unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/check-answers')
  })
})

test.describe('/bulk-edit-transfers/check-answers', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubPutBulkTransfers(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page) => {
    await page.goto('/bulk-edit-transfers?start=01/01/2001&end=31/01/2001')
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
        selectedTransfers: [transfer1.person.identifier],
        transfers: [
          {
            prisoner: transfer1.person,
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
    await page.goto(`/${journeyId}/bulk-edit-transfers/check-answers`)
  }

  test('should try all cases', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransfersCheckAnswersPage(page).verifyContent()
    await testPage.verifyAnswer('Date', '1 January 2001')
    await testPage.verifyAnswer('Time', '10:00')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')

    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')

    await testPage.verifyLink('Change bulk transfer list details', /edit-list/)
    await testPage.verifyLink('Change prisoners in this bulk transfer', /edit-list/)

    await testPage.verifyLink('Change reason for Name One', /change-details\/A1234EA#reason/)
    await testPage.verifyLink('Change comments for Name One', /change-details\/A1234EA#comments/)

    await expect(testPage.button('Confirm edits')).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Confirm edits')
    expect(page.url()).toMatch(/\/bulk-edit-transfers\/confirmation/)
  })
})
