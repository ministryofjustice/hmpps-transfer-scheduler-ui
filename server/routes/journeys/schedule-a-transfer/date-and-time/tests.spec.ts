import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'

import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { ScheduleTransferDateTimePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'

test.describe('/schedule-a-transfer/date-and-time unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/date-and-time')
  })
})

test.describe('/schedule-a-transfer/date-and-time', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents(), stubGetPrisonerImage(), stubGetPrisonerDetails()])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/schedule-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)
    await page.goto(`/${journeyId}/schedule-a-transfer/date-and-time`)
  }

  test('should enter date and time for schedule-a-transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferDateTimePage(page).verifyContent()

    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.dateField()).toHaveValue('')
    await expect(testPage.hourField()).toBeVisible()
    await expect(testPage.hourField()).toHaveValue('')
    await expect(testPage.minuteField()).toBeVisible()
    await expect(testPage.minuteField()).toHaveValue('')
    await expect(testPage.button('Continue')).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter or select a transfer date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a transfer time').click()
    await expect(testPage.hourField()).toBeFocused()

    await testPage.dateField().fill('1/1/1999')
    await testPage.hourField().fill('24')
    await testPage.minuteField().fill('1.2')
    await testPage.clickContinue()

    await testPage.link('Transfer date must be today or in the future').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Transfer hour must be between 00 and 23').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Transfer minute must be between 00 and 59').click()
    await expect(testPage.minuteField()).toBeFocused()

    await testPage.dateField().fill('1999-1-1')
    await testPage.clickContinue()
    await testPage.link('Enter the transfer date in the correct format, for example, 17/5/2024').click()
    await expect(testPage.dateField()).toBeFocused()

    await testPage.dateField().fill('32/2/2001')
    await testPage.clickContinue()
    await testPage.link('Enter a real date for the transfer date').click()
    await expect(testPage.dateField()).toBeFocused()

    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('0')
    await testPage.minuteField().fill('0')
    await testPage.clickContinue()
    await testPage.link('Start time must be in the future').click()
    await expect(testPage.hourField()).toBeFocused()

    // verify next page routing
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/schedule-a-transfer\/destination/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
  })
})
