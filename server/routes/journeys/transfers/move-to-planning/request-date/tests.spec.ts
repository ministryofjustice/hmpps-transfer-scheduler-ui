import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { formatInputDate, inputDate } from '../../../../../utils/dateTimeUtils'
import { PlanTransferRequestDatePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { stubGetTransfer } from '../../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/transfers/move-to-planning/request-date unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/move-to-planning/request-date')
  })
})

test.describe('/transfers/move-to-planning/request-date', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
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
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should enter request date for transfers/move-to-planning', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-move-to-planning/${transferId}`)

    // verify page content
    const testPage = await new PlanTransferRequestDatePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter or select a request date').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill(inputDate(10))
    await testPage.clickContinue()
    await testPage.link('Request date must be today or in the past').click()

    await testPage.dateField().fill('1999-1-1')
    await testPage.clickContinue()
    await testPage.link('Enter the request date in the correct format, for example, 17/5/2024').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill('32/2/2001')
    await testPage.clickContinue()
    await testPage.link('Enter a real date for the request date').click()
    await expect(testPage.dateField()).toBeFocused()

    // verify next page routing
    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/transfers\/move-to-planning\/priority/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
  })
})
