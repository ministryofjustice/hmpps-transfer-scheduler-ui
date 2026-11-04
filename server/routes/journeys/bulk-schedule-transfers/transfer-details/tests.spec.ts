import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails, stubSearchPrisoner } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkScheduleTransferDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetLogistics, stubGetReasons } from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { stubGetNonAssociations } from '../../../../../integration_tests/mockApis/nonAssociationsApi'
import { testNonAssociationResponse, prisoner1, prisoner2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-schedule-transfers/transfer-details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-schedule-transfers/transfer-details/PRISON_NUMBER')
  })
})

test.describe('/bulk-schedule-transfers/transfer-details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubSearchPrisoner('LEI', '.+', {
        content: [prisoner1, prisoner2],
      }),
      stubGetPrisonerDetails(prisoner1),
      stubGetPrisonerDetails(prisoner2),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
    ])

    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/bulk-schedule-transfers`)
    await injectJourneyData(page, journeyId, {
      bulkScheduleTransfer: {
        transfers: [{ prisoner: prisoner1 }, { prisoner: prisoner2 }],
      },
    })
    await page.goto(`/${journeyId}/bulk-schedule-transfers/transfer-details/${prisoner1.prisonerNumber}`)
  }

  test('should enter transfer details for multiple persons and proceed to check answers', async ({ page }) => {
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
    const testPage = await new BulkScheduleTransferDetailsPage(page).verifyContent()
    await expect(page.getByRole('heading', { name: 'Enter the details for Name One' })).toBeVisible()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickButton('Save and next')
    await testPage.link('Enter or select a transfer date').click()
    await expect(testPage.dateField()).toBeFocused()
    await testPage.link('Enter a transfer time').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('Enter and select a prison').click()
    await expect(testPage.destinationInput()).toBeFocused()
    await testPage.link('Enter and select a reason').click()
    await expect(testPage.reasonInput()).toBeFocused()
    await testPage.link('Enter and select an escort type').click()
    await expect(testPage.logisticsInput()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify enter details and proceed to next prisoner
    const today = formatInputDate(new Date().toISOString())!
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
    await testPage.clickButton('Save and next')

    await expect(page.getByRole('heading', { name: 'Enter the details for Another Two' })).toBeVisible()

    // verify inputs are pre-filled for next person
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')

    // verify next page routing
    await testPage.clickButton('Save and next')
    expect(page.url()).toMatch(/\/bulk-schedule-transfers\/check-answers/)
  })

  test('should enter transfer details and proceed to non-associations page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await stubGetNonAssociations(testNonAssociationResponse)

    // verify page content
    const testPage = await new BulkScheduleTransferDetailsPage(page).verifyContent()

    // enter details
    const today = formatInputDate(new Date().toISOString())!
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
    await testPage.clickButton('Save and next')

    // verify next page routing
    await testPage.clickButton('Save and next')
    expect(page.url()).toMatch(/\/bulk-schedule-transfers\/non-associations/)
  })
})
