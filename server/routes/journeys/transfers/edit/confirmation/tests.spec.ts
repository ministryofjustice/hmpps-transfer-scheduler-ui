import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferConfirmationPage } from './test.page'

import { login } from '../../../../../../integration_tests/testUtils'
import { resetStubs } from '../../../../../../integration_tests/mockApis/wiremock'
import { stubGetTransfer } from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'

test.describe('/transfers/edit/confirmation unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/confirmation')
  })
})

test.describe('/transfers/edit/confirmation', () => {
  const transferId = uuidV4()

  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
      }),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should confirm court appearance cancelled', async ({ page }) => {
    await login(page)

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/cancel`)
    await injectJourneyData(page, journeyId, {
      updateTransfer: {
        backUrl: `/transfers/${transferId}`,
        transfer: testTransfer,
        historyQuery: 'historyQuery',
        result: {
          content: [
            {
              user: { username: 'USERNAME', name: 'User Name' },
              occurredAt: '2025-12-01T17:50:20.421301',
              domainEvents: ['person.transfer.cancelled'],
              changes: [{ propertyName: '', previous: '', change: '' }],
            },
          ],
        },
      },
    })
    await page.goto(`${journeyId}/transfers/edit/confirmation`)

    // verify page content
    const testPage = await new EditTransferConfirmationPage(page).verifyContent()

    await expect(page.getByText('Transfer cancelled for Prisoner-Name Prisoner-Surname')).toBeVisible()

    await testPage.verifyLink('Back to Transfers homepage', '/')
    await testPage.verifyLink('Back to View and manage scheduled transfers', '/scheduled-transfers')
  })
})
