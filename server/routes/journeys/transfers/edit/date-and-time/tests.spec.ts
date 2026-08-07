import { v4 as uuidV4 } from 'uuid'
import { expect, test } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import { EditTransferDateTimePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import {
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/transfers/edit/date-and-time unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/date-and-time')
  })
})

test.describe('/transfers/edit/date-and-time', () => {
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
      }),
      await stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.transfer.rescheduled'],
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

  test('should change the date and time of a transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/date-and-time`)

    // verify page content
    const testPage = await new EditTransferDateTimePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('1/1/2001')
    await expect(testPage.hourField()).toBeVisible()
    await expect(testPage.hourField()).toHaveValue('09')
    await expect(testPage.minuteField()).toBeVisible()
    await expect(testPage.minuteField()).toHaveValue('15')
    await expect(testPage.button('Save')).toBeVisible()

    // verify validation error
    await testPage.dateField().fill('1/1/1999')
    await testPage.hourField().fill('24')
    await testPage.minuteField().fill('1.2')
    await testPage.clickButton('Save')

    await testPage.link('Transfer date must be today or in the future').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Transfer hour must be between 00 and 23').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Transfer minute must be between 00 and 59').click()
    await expect(testPage.minuteField()).toBeFocused()

    await testPage.dateField().fill('1999-1-1')
    await testPage.clickButton('Save')
    await testPage.link('Enter the transfer date in the correct format, for example, 17/5/2024').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill('32/2/2001')
    await testPage.clickButton('Save')
    await testPage.link('Enter a real date for the transfer date').click()
    await expect(testPage.dateField()).toBeFocused()

    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('0')
    await testPage.minuteField().fill('0')
    await testPage.clickButton('Save')
    await testPage.link('Start time must be in the future').click()
    await expect(testPage.hourField()).toBeFocused()

    // verify next page routing
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.clickButton('Save')

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer date and time changed')).toBeVisible()
  })
})
