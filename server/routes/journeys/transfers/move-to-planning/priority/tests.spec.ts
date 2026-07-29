import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { MoveTransferToPlanningPriorityPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import {
  stubGetPriorities,
  stubGetTransfer,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/move-to-planning/priority unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/move-to-planning/priority')
  })
})

test.describe('/transfers/move-to-planning/priority', () => {
  const transferId = uuidV4()

  const transfer = {
    ...testTransfer,
    id: transferId,
  }

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPriorities(),
      stubGetTransfer(transfer),
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
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`${journeyId}/transfers/start-move-to-planning/${transferId}`)
    await injectJourneyData(page, journeyId, {
      moveTransferToPlanning: {
        backUrl: 'back-url',
        historyQuery: 'history',
        transfer,
        requestedOn: '2001-01-01',
      },
    })
    await page.goto(`/${journeyId}/transfers/move-to-planning/priority`)
  }

  test('should enter priority for transfers/move-to-planning', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new MoveTransferToPlanningPriorityPage(page).verifyContent()

    await expect(testPage.priorityRadio()).toBeVisible()
    await expect(testPage.priorityRadio()).not.toBeChecked()
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Save')
    await testPage.link('Select the priority of this transfer').click()
    await expect(testPage.priorityRadio()).toBeFocused()

    // verify next page routing
    await testPage.priorityRadio().click()
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/move-to-planning\/confirmation/)

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'PlanTransfer', requestedOn: '2001-01-01', priorityCode: '1' }],
    })
  })
})
