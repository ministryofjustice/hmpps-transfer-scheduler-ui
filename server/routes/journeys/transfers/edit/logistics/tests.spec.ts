import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferLogisticsPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import {
  stubGetLogistics,
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/edit/logistics unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/logistics')
  })
})

test.describe('/transfers/edit/logistics', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetLogistics(),
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

  test('should change logistics for a transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/logistics`)

    // verify page content
    const testPage = await new EditTransferLogisticsPage(page).verifyContent()

    await expect(testPage.logisticsInput()).toBeVisible()
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.logisticsInput().fill('')
    await page.keyboard.press('Escape')
    await testPage.clickButton('Save')
    await testPage.link('Enter and select an escort type').click()
    await expect(testPage.logisticsInput()).toBeFocused()

    // verify next page routing
    await testPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer escort details changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyLogistics', logisticsCode: 'L2' }],
    })
  })
})
