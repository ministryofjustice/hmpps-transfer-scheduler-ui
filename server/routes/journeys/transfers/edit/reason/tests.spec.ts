import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferReasonPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import {
  stubGetReasons,
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/edit/reason unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/reason')
  })
})

test.describe('/transfers/edit/reason', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetReasons(),
      stubGetPrisons(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
      }),
      await stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, { content: [] }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should change reason for a transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/reason`)

    // verify page content
    const testPage = await new EditTransferReasonPage(page).verifyContent()

    await expect(testPage.reasonInput()).toBeVisible()
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.reasonInput().fill('')
    await page.keyboard.press('Escape')
    await testPage.clickButton('Save')
    await testPage.link('Enter and select a reason').click()
    await expect(testPage.reasonInput()).toBeFocused()

    // verify next page routing
    await testPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer reason changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyReason', reasonCode: 'R2' }],
    })
  })
})
