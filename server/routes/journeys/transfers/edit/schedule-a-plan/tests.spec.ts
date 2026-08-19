import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { SchedulePlanPage } from './test.page'

import { login } from '../../../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../../../integration_tests/mockApis/wiremock'
import { stubGetTransfer, stubPutTransfer } from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/transfers/edit/schedule-a-plan unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/schedule-a-plan')
  })
})

test.describe('/transfers/edit/schedule-a-plan', () => {
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
        plan: { requestedOn: '2001-01-01', comments: 'Lorem ipsum', priority: { code: '1', description: 'High' } },
        stage: 'PLANNING',
      }),
      stubPutTransfer(transferId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.transfer.scheduled'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
      }),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should schedule a transfer plan', async ({ page }) => {
    await login(page)

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/schedule-a-plan`)

    // verify page content
    const testPage = await new SchedulePlanPage(page).verifyContent()

    await expect(testPage.yesRadio()).toBeVisible()
    await expect(testPage.yesRadio()).not.toBeChecked()
    await expect(testPage.noRadio()).toBeVisible()
    await expect(testPage.noRadio()).not.toBeChecked()
    await expect(testPage.button('Confirm')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Confirm')
    await testPage.link('Select if you want to schedule this plan').click()
    await expect(testPage.yesRadio()).toBeFocused()

    // verify next page routing
    await testPage.yesRadio().click()
    await testPage.clickButton('Confirm')
    expect(page.url()).toMatch(/\/transfers\/edit\/confirmation/)

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ScheduleTransfer', start: '2001-01-01T09:15:00' }],
    })
  })
})
