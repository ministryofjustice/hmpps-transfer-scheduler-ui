import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { TransferCancelPage } from './test.page'

import { login } from '../../../../../../integration_tests/testUtils'
import { getApiBody, getAPICallCountMatching, resetStubs } from '../../../../../../integration_tests/mockApis/wiremock'
import {
  stubGetCancellationReasons,
  stubGetTransfer,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/transfers/edit/cancel unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/cancel')
  })
})

test.describe('/transfers/edit/cancel', () => {
  const transferId = uuidV4()

  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetCancellationReasons(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
      }),
      stubPutTransfer(transferId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.transfer.cancelled'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should cancel transfer', async ({ page }) => {
    await login(page)

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/cancel`)

    // verify page content
    const testPage = await new TransferCancelPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.cancellationReasonRadio()).not.toBeVisible()
    await expect(testPage.reasonField()).not.toBeVisible()
    await expect(testPage.button('Confirm')).toBeVisible()

    // verify validation error

    await testPage.clickButton('Confirm')
    await testPage.link('Select if you want to cancel this transfer').click()
    await expect(testPage.yesRadio()).toBeFocused()

    await testPage.yesRadio().click()
    await expect(testPage.cancellationReasonRadio()).toBeVisible()
    await expect(testPage.cancellationReasonRadio()).not.toBeChecked()
    await expect(testPage.reasonField()).toBeVisible()
    await expect(testPage.reasonField()).toHaveValue('')
    await testPage.reasonField().fill('lorem ipsum')
    await testPage.clickButton('Confirm')
    await testPage.link('Select a cancellation reason').click()
    await expect(testPage.cancellationReasonRadio()).toBeFocused()

    // verify next page routing
    await testPage.cancellationReasonRadio().click()
    await testPage.clickButton('Confirm')
    expect(page.url()).toMatch(/\/transfers\/edit\/confirmation/)

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'CancelTransfer', reasonCode: 'OIC' }],
      reason: 'lorem ipsum',
    })
  })

  test('should confirm not to cancel transfer and return to transfer details page', async ({ page }) => {
    await login(page)

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/cancel`)

    // verify page content
    const testPage = await new TransferCancelPage(page).verifyContent()

    // verify next page routing
    await testPage.noRadio().click()
    await testPage.clickButton('Confirm')
    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    // verify API call
    expect(await getAPICallCountMatching(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toEqual(0)
  })
})
