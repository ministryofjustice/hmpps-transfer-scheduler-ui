import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { formatInputDate, inputDate } from '../../../../../utils/dateTimeUtils'
import { EditTransferRequestDatePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/edit/request-date unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/request-date')
  })
})

test.describe('/transfers/edit/request-date', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
        plan: { requestedOn: '2001-01-01', comments: 'Lorem ipsum', priority: { code: '1', description: 'High' } },
      }),
      await stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, { content: [] }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should change request date for a transfer plan', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/request-date`)

    // verify page content
    const testPage = await new EditTransferRequestDatePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('1/1/2001')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.dateField().fill('')
    await testPage.clickButton('Save')
    await testPage.link('Enter or select a request date').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill(inputDate(10))
    await testPage.clickButton('Save')
    await testPage.link('Request date must be today or in the past').click()

    await testPage.dateField().fill('1999-1-1')
    await testPage.clickButton('Save')
    await testPage.link('Enter the request date in the correct format, for example, 17/5/2024').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill('32/2/2001')
    await testPage.clickButton('Save')
    await testPage.link('Enter a real date for the request date').click()
    await expect(testPage.dateField()).toBeFocused()

    // verify next page routing
    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer request date changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyRequestedOn', requestedOn: expect.any(String) }],
    })
  })
})
