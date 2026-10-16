import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { testPrisonerDetails } from '../../../../integration_tests/data/testData'
import { ScheduleTransferDateTimePage } from './date-and-time/test.page'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import { ScheduleTransferDestinationPage } from './destination/test.page'
import {
  stubGetLogistics,
  stubGetReasons,
  stubPostScheduledTransfer,
} from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { ScheduleTransferReasonPage } from './reason/test.page'
import { ScheduleTransferLogisticsPage } from './logistics/test.page'
import { ScheduleTransferCommentsPage } from './comments/test.page'
import { ScheduleTransferCheckAnswersPage } from './check-answers/test.page'
import { ScheduleTransferConfirmationPage } from './confirmation/test.page'

test.describe('/schedule-a-transfer e2e ', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
      stubPostScheduledTransfer(testPrisonerDetails.prisonerNumber),
      stubGetNonAssociations({
        closedCount: '',
        firstName: '',
        lastName: '',
        nonAssociations: [],
        openCount: '',
        prisonerNumber: '',
      }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should create new scheduled transfer', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/schedule-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)

    // fill in all pages
    const dateTimePage = await new ScheduleTransferDateTimePage(page).verifyContent()
    await dateTimePage.dateField().fill('31/12/2047')
    await dateTimePage.hourField().fill('10')
    await dateTimePage.minuteField().fill('00')
    await dateTimePage.clickContinue()

    const destinationPage = await new ScheduleTransferDestinationPage(page).verifyContent()
    await destinationPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await destinationPage.clickContinue()

    const reasonPage = await new ScheduleTransferReasonPage(page).verifyContent()
    await reasonPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await reasonPage.clickContinue()

    const logisticsPage = await new ScheduleTransferLogisticsPage(page).verifyContent()
    await logisticsPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await logisticsPage.clickContinue()

    const commentsPage = await new ScheduleTransferCommentsPage(page).verifyContent()
    await commentsPage.clickContinue()

    const checkAnswersPage = await new ScheduleTransferCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Date', '31 December 2047')
    await checkAnswersPage.verifyAnswer('Time', '10:00')
    await checkAnswersPage.verifyAnswer('Destination', 'Prison One')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics One')
    await checkAnswersPage.verifyAnswer('Comments', 'Not provided')

    // verify changing answers
    await checkAnswersPage.clickLink('Change date')
    await dateTimePage.dateField().fill('30/12/2047')
    await dateTimePage.clickContinue()
    await checkAnswersPage.verifyAnswer('Date', '30 December 2047')

    await checkAnswersPage.clickLink('Change time')
    await dateTimePage.hourField().fill('11')
    await dateTimePage.minuteField().fill('30')
    await dateTimePage.clickContinue()
    await checkAnswersPage.verifyAnswer('Time', '11:30')

    await checkAnswersPage.clickLink('Change destination')
    await destinationPage.destinationInput().clear()
    await destinationPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await destinationPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Destination', 'Prison Two')

    await checkAnswersPage.clickLink('Change reason')
    await reasonPage.reasonInput().clear()
    await reasonPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await reasonPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change escort details')
    await logisticsPage.logisticsInput().clear()
    await logisticsPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await logisticsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics Two')

    await checkAnswersPage.clickLink('Change comments')
    await commentsPage.commentsField().fill('Lorem ipsum')
    await commentsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Comments', 'Lorem ipsum')

    // proceed to confirmation
    await checkAnswersPage.clickButton('Confirm and save')

    await new ScheduleTransferConfirmationPage(page).verifyContent()

    expect(await getApiBody(`/transfer-scheduler-api/transfers/${testPrisonerDetails.prisonerNumber}`)).toContainEqual({
      schedule: { start: '2047-12-30T11:30:00', comments: 'Lorem ipsum' },
      destinationCode: 'P2',
      reasonCode: 'R2',
      logisticsCode: 'L2',
    })
  })
})
