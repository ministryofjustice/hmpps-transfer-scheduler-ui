import { test, expect, Page } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferDetailsPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubGetTransferClashes,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { stubGetNonAssociations } from '../../../../../integration_tests/mockApis/nonAssociationsApi'
import { testNonAssociationResponse, testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { stubGetCourtAppearanceClashes } from '../../../../../integration_tests/mockApis/courtAppearanceSchedulerApi'
import { stubGetTemporaryAbsenceClashes } from '../../../../../integration_tests/mockApis/externalMovementsApi'

test.describe('/schedule-a-transfer/transfer-details unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/schedule-a-transfer/transfer-details')
  })
})

test.describe('/schedule-a-transfer/transfer-details', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
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
    await page.goto(`/${journeyId}/schedule-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)
    await page.goto(`/${journeyId}/schedule-a-transfer/transfer-details`)
  }

  test('should enter transfer details and proceed to check answers', async ({ page }) => {
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

    await Promise.all([
      stubGetCourtAppearanceClashes([]),
      stubGetTemporaryAbsenceClashes([]),
      stubGetTransferClashes([]),
    ])

    // verify page content
    const testPage = await new ScheduleTransferDetailsPage(page).verifyContent()

    // verify validation error
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.clickContinue()
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

    // verify next page routing
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
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/schedule-a-transfer\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
  })

  test('should enter transfer details and proceed to conflicts page', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    await stubGetNonAssociations(testNonAssociationResponse)

    await Promise.all([
      stubGetCourtAppearanceClashes([
        {
          start: '2001-01-01T10:00:00',
          end: '2001-01-01T17:00:00',
          description: {
            full: 'Police production',
            short: '',
          },
          location: {
            description: '',
          },
          additionalInformation: {
            prisonCode: '',
          },
        },
      ]),
      stubGetTemporaryAbsenceClashes([]),
      stubGetTransferClashes([]),
    ])

    // verify page content
    const testPage = await new ScheduleTransferDetailsPage(page).verifyContent()

    // verify next page routing
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
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/schedule-a-transfer\/conflicts/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
  })
})
