import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferDestinationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/edit/destination unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/destination')
  })
})

test.describe('/transfers/edit/destination', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      await stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, { content: [] }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should change destination for a transfer', async ({ page }) => {
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
    })

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/destination`)

    // verify page content
    const testPage = await new EditTransferDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.destinationInput().fill('')
    await page.keyboard.press('Escape')
    await testPage.clickButton('Save')
    await testPage.link('Enter and select a prison').click()
    await expect(testPage.destinationInput()).toBeFocused()

    // verify next page routing
    await testPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer destination changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyDestination', destinationCode: 'P2' }],
    })
  })

  test('should unset destination for a transfer plan', async ({ page }) => {
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
      stage: 'PLANNING',
    })

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/destination`)

    // verify page content
    const testPage = await new EditTransferDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.button('Save')).toBeVisible()

    // verify next page routing
    await testPage.destinationInput().fill('')
    await page.keyboard.press('Escape')
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer destination changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyDestination', destinationCode: null }],
    })
  })
})
