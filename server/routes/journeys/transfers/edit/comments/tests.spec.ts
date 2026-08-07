import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferCommentsPage } from './test.page'
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

test.describe('/transfers/edit/comments unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/comments')
  })
})

test.describe('/transfers/edit/comments', () => {
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

  test('should change comments for transfer schedule', async ({ page }) => {
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
    })

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/comments`)

    // verify page content
    const testPage = await new EditTransferCommentsPage(page).verifyContent()

    await expect(testPage.commentsField()).toBeVisible()
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickButton('Save')
    await testPage.link('The maximum character limit is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.commentsField().fill('dolor sit')
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer schedule comments changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyScheduleComments', comments: 'dolor sit' }],
    })
  })

  test('should change comments for transfer plan', async ({ page }) => {
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
      stage: 'PLANNING',
    })

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/comments`)

    // verify page content
    const testPage = await new EditTransferCommentsPage(page).verifyContent()

    await expect(testPage.commentsField()).toBeVisible()
    await expect(testPage.commentsField()).toHaveValue('')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickButton('Save')
    await testPage.link('The maximum character limit is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.commentsField().fill('dolor sit')
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer plan comments changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyPlanComments', comments: 'dolor sit' }],
    })
  })
})
