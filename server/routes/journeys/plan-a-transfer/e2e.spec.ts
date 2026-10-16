import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { testPrisonerDetails } from '../../../../integration_tests/data/testData'
import { PlanTransferDateTimePage } from './date-and-time/test.page'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import { PlanTransferDestinationPage } from './destination/test.page'
import {
  stubGetLogistics,
  stubGetPriorities,
  stubGetReasons,
  stubPostScheduledTransfer,
} from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { PlanTransferReasonPage } from './reason/test.page'
import { PlanTransferLogisticsPage } from './logistics/test.page'
import { PlanTransferCommentsPage } from './comments/test.page'
import { PlanTransferCheckAnswersPage } from './check-answers/test.page'
import { PlanTransferConfirmationPage } from './confirmation/test.page'
import { PlanTransferRequestDatePage } from './request-date/test.page'
import { PlanTransferPriorityPage } from './priority/test.page'

test.describe('/plan-a-transfer e2e ', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPriorities(),
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

  test('should create new planned transfer with minimal data', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/plan-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)

    // fill in all pages
    const requestDatePage = await new PlanTransferRequestDatePage(page).verifyContent()
    await requestDatePage.dateField().fill('1/1/2001')
    await requestDatePage.clickContinue()

    const reasonPage = await new PlanTransferReasonPage(page).verifyContent()
    await reasonPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await reasonPage.clickContinue()

    const priorityPage = await new PlanTransferPriorityPage(page).verifyContent()
    await priorityPage.priorityRadio().click()
    await priorityPage.clickContinue()

    const dateTimePage = await new PlanTransferDateTimePage(page).verifyContent()
    await dateTimePage.clickContinue()

    const destinationPage = await new PlanTransferDestinationPage(page).verifyContent()
    await destinationPage.clickContinue()

    const logisticsPage = await new PlanTransferLogisticsPage(page).verifyContent()
    await logisticsPage.clickContinue()

    const commentsPage = await new PlanTransferCommentsPage(page).verifyContent()
    await commentsPage.clickContinue()

    const checkAnswersPage = await new PlanTransferCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Request received', '1 January 2001')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Priority', 'High')
    await checkAnswersPage.verifyAnswer('Date and time', 'Not provided')
    await checkAnswersPage.verifyAnswer('Destination (optional)', 'Not provided')
    await checkAnswersPage.verifyAnswer('Escort details (optional)', 'Not provided')
    await checkAnswersPage.verifyAnswer('Comments (optional)', 'Not provided')

    // proceed to confirmation
    await checkAnswersPage.clickButton('Confirm plan')

    await new PlanTransferConfirmationPage(page).verifyContent()

    expect(await getApiBody(`/transfer-scheduler-api/transfers/${testPrisonerDetails.prisonerNumber}`)).toContainEqual({
      plan: { requestedOn: '2001-01-01', priorityCode: '1' },
      reasonCode: 'R1',
    })
  })

  test('should create new planned transfer with full details', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/plan-a-transfer/start/${testPrisonerDetails.prisonerNumber}`)

    // fill in all pages
    const requestDatePage = await new PlanTransferRequestDatePage(page).verifyContent()
    await requestDatePage.dateField().fill('1/1/2001')
    await requestDatePage.clickContinue()

    const reasonPage = await new PlanTransferReasonPage(page).verifyContent()
    await reasonPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await reasonPage.clickContinue()

    const priorityPage = await new PlanTransferPriorityPage(page).verifyContent()
    await priorityPage.priorityRadio().click()
    await priorityPage.clickContinue()

    const dateTimePage = await new PlanTransferDateTimePage(page).verifyContent()
    await dateTimePage.dateField().fill('31/12/2047')
    await dateTimePage.hourField().fill('10')
    await dateTimePage.minuteField().fill('00')
    await dateTimePage.clickContinue()

    const destinationPage = await new PlanTransferDestinationPage(page).verifyContent()
    await destinationPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await destinationPage.clickContinue()

    const logisticsPage = await new PlanTransferLogisticsPage(page).verifyContent()
    await logisticsPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await logisticsPage.clickContinue()

    const commentsPage = await new PlanTransferCommentsPage(page).verifyContent()
    await commentsPage.clickContinue()

    const checkAnswersPage = await new PlanTransferCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Request received', '1 January 2001')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Priority', 'High')
    await checkAnswersPage.verifyAnswer('Date and time', '31 December 2047 at 10:00')
    await checkAnswersPage.verifyAnswer('Destination (optional)', 'Prison One')
    await checkAnswersPage.verifyAnswer('Escort details (optional)', 'Logistics One')
    await checkAnswersPage.verifyAnswer('Comments (optional)', 'Not provided')

    // verify changing answers
    await checkAnswersPage.clickLink('Change request date')
    await requestDatePage.dateField().fill('02/01/2001')
    await requestDatePage.clickContinue()
    await checkAnswersPage.verifyAnswer('Request received', '2 January 2001')

    await checkAnswersPage.clickLink('Change reason')
    await reasonPage.reasonInput().clear()
    await reasonPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await reasonPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change priority')
    await priorityPage.priorityLowRadio().click()
    await priorityPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Priority', 'Low')

    await checkAnswersPage.clickLink('Change date and time')
    await dateTimePage.dateField().fill('30/12/2047')
    await dateTimePage.hourField().fill('11')
    await dateTimePage.minuteField().fill('30')
    await dateTimePage.clickContinue()
    await checkAnswersPage.verifyAnswer('Date and time', '30 December 2047 at 11:30')

    await checkAnswersPage.clickLink('Change destination')
    await destinationPage.destinationInput().clear()
    await destinationPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await destinationPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Destination (optional)', 'Prison Two')

    await checkAnswersPage.clickLink('Change escort details')
    await logisticsPage.logisticsInput().clear()
    await logisticsPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await logisticsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Escort details (optional)', 'Logistics Two')

    await checkAnswersPage.clickLink('Change comments')
    await commentsPage.commentsField().fill('Lorem ipsum')
    await commentsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Comments (optional)', 'Lorem ipsum')

    // proceed to confirmation
    await checkAnswersPage.clickButton('Confirm plan')

    await new PlanTransferConfirmationPage(page).verifyContent()

    expect(await getApiBody(`/transfer-scheduler-api/transfers/${testPrisonerDetails.prisonerNumber}`)).toContainEqual({
      plan: { requestedOn: '2001-01-02', priorityCode: '3', comments: 'Lorem ipsum' },
      reasonCode: 'R2',
      schedule: { start: '2047-12-30T11:30:00' },
      destinationCode: 'P2',
      logisticsCode: 'L2',
    })
  })
})
