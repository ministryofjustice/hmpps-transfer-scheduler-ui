import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../integration_tests/mockApis/prisonApi'
import { ManageTransferPage } from './test.page'
import { NotAuthorisedPage } from '../../../integration_tests/pages/NotAuthorisedPage'

import { login } from '../../../integration_tests/testUtils'
import { resetStubs } from '../../../integration_tests/mockApis/wiremock'
import { stubGetTransfer, stubGetTransferHistory } from '../../../integration_tests/mockApis/transferSchedulerApi'
import { testTransfer } from '../../../integration_tests/data/testData'
import { stubGetPrisons } from '../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/transfers/:id', () => {
  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should show 403 error if transfer is outside the user caseloads', async ({ page }) => {
    await login(page)

    const transferId = uuidV4()
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
      prison: { code: 'OUT', name: 'OUT' },
    })
    await stubGetTransferHistory(transferId, { content: [] })
    await page.goto(`/transfers/${transferId}`)
    await new NotAuthorisedPage(page).verifyContent()
  })

  test('should show transfer details and edit links', async ({ page }) => {
    await login(page)

    const transferId = uuidV4()
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
    })
    await stubGetTransferHistory(transferId, {
      content: [
        {
          domainEvents: ['person.transfer.scheduled'],
          occurredAt: '2001-01-01T09:05:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [],
        },
        {
          domainEvents: ['person.transfer.rescheduled'],
          occurredAt: '2001-01-01T09:15:00',
          user: { name: 'User Name', username: 'USERNAME' },
          changes: [{ propertyName: 'start', previous: '2001-01-01T09:30:00', change: '2001-01-01T10:00:00' }],
        },
      ],
    })
    await page.goto(`/transfers/${transferId}`)

    // verify page content
    const testPage = await new ManageTransferPage(page).verifyContent()

    await testPage.verifyAnswer('Date and time', '1 January 2001 at 09:15')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')
    await testPage.verifyAnswer('Status', 'Scheduled')

    await expect(testPage.link('Change date and time (Transfer information)')).toBeVisible()
    await expect(testPage.link('Change destination (Transfer information)')).toBeVisible()
    await expect(testPage.link('Change reason (Transfer information)')).toBeVisible()
    await expect(testPage.link('Change escort details (Transfer information)')).toBeVisible()
    await expect(testPage.link('Change comments (Transfer information)')).toBeVisible()

    await expect(testPage.button('Cancel this transfer')).toBeVisible()
    await expect(testPage.button('Move to planned transfers')).toBeVisible()

    // verify history tab
    await testPage.clickTab('Transfer history')

    await testPage.verifyHistoryEntry(/^Scheduled$/, ['Transfer scheduled for Prisoner-Name Prisoner-Surname'], [])
    await testPage.verifyHistoryEntry(
      'Rescheduled',
      [],
      ['Start date and time was changed from 1 January 2001 at 09:30 to 1 January 2001 at 10:00'],
    )
  })

  test('should not show edit links for view only user', async ({ page }) => {
    await login(page, { roles: ['ROLE_TRANSFER_SCHEDULER_RO'] })
    const transferId = uuidV4()
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
    })
    await stubGetTransferHistory(transferId, { content: [] })
    await page.goto(`/transfers/${transferId}`)

    // verify page content
    const testPage = await new ManageTransferPage(page).verifyContent()

    await testPage.verifyAnswer('Date and time', '1 January 2001 at 09:15')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')
    await testPage.verifyAnswer('Status', 'Scheduled')

    await expect(testPage.link('Change date and time (Transfer information)')).toHaveCount(0)
    await expect(testPage.link('Change destination (Transfer information)')).toHaveCount(0)
    await expect(testPage.link('Change reason (Transfer information)')).toHaveCount(0)
    await expect(testPage.link('Change escort details (Transfer information)')).toHaveCount(0)
    await expect(testPage.link('Change comments (Transfer information)')).toHaveCount(0)

    await expect(testPage.button('Cancel this transfer')).toHaveCount(0)
    await expect(testPage.button('Move to planned transfers')).toHaveCount(0)
  })
})
