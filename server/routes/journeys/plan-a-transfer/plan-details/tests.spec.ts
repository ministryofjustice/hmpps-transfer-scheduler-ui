import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { PlanTransferDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetLogistics,
  stubGetPriorities,
  stubGetReasons,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { stubGetNonAssociations } from '../../../../../integration_tests/mockApis/nonAssociationsApi'
import { testNonAssociationResponse, testPrisonerDetails } from '../../../../../integration_tests/data/testData'

test.describe('/plan-a-transfer/plan-details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/plan-a-transfer/plan-details')
  })
})

test.describe('/plan-a-transfer/plan-details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubGetPriorities(),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/plan-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)
    await page.goto(`/${journeyId}/plan-a-transfer/plan-details`)
  }

  test('should enter transfer plan details and proceed to check answers', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await stubGetNonAssociations({
      closedCount: '',
      firstName: '',
      lastName: '',
      nonAssociations: [],
      openCount: '',
      prisonerNumber: '',
    })

    // verify page content
    const testPage = await new PlanTransferDetailsPage(page).verifyContent()

    // verify validation error
    await testPage.dateField().fill('2001-01-01')
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickContinue()

    await testPage.link('Enter or select a request date').click()
    await expect(testPage.requestDateField()).toBeFocused()
    await testPage.link('Enter and select a reason').click()
    await expect(testPage.reasonInput()).toBeFocused()
    await testPage.link('Select the priority of this transfer').click()
    await expect(testPage.priorityRadio()).toBeFocused()
    await testPage.link('Enter the transfer date in the correct format, for example, 17/5/2024').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a transfer time').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    const today = formatInputDate(new Date().toISOString())!
    await testPage.requestDateField().fill('01/01/2001')
    await testPage.priorityRadio().click()
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/plan-a-transfer\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.requestDateField()).toHaveValue('1/1/2001')
    await expect(testPage.priorityRadio()).toBeChecked()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
  })

  test('should enter transfer plan details and proceed to non-associations page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await stubGetNonAssociations(testNonAssociationResponse)

    // verify page content
    const testPage = await new PlanTransferDetailsPage(page).verifyContent()

    // verify next page routing
    await testPage.requestDateField().fill('01/01/2001')
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.priorityRadio().click()
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/plan-a-transfer\/non-associations/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.requestDateField()).toHaveValue('1/1/2001')
    await expect(testPage.priorityRadio()).toBeChecked()
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')

    await expect(testPage.dateField()).toHaveValue('')
    await expect(testPage.hourField()).toHaveValue('')
    await expect(testPage.minuteField()).toHaveValue('')
    await expect(testPage.logisticsInput()).toHaveValue('')
    await expect(testPage.commentsField()).toHaveValue('')
  })
})
