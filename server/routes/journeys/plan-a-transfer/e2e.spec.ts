import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { testPrisonerDetails } from '../../../../integration_tests/data/testData'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import {
  stubGetLogistics,
  stubGetPriorities,
  stubGetReasons,
  stubPostScheduledTransfer,
} from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { PlanTransferCheckAnswersPage } from './check-answers/test.page'
import { PlanTransferConfirmationPage } from './confirmation/test.page'
import { PlanTransferDetailsPage } from './plan-details/test.page'

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
    const detailsPage = await new PlanTransferDetailsPage(page).verifyContent()
    await detailsPage.requestDateField().fill('1/1/2001')
    await detailsPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await detailsPage.priorityRadio().click()
    await detailsPage.clickContinue()

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
    const detailsPage = await new PlanTransferDetailsPage(page).verifyContent()
    await detailsPage.requestDateField().fill('1/1/2001')
    await detailsPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await detailsPage.priorityRadio().click()
    await detailsPage.dateField().fill('31/12/2047')
    await detailsPage.hourField().fill('10')
    await detailsPage.minuteField().fill('00')
    await detailsPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await detailsPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await detailsPage.clickContinue()

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
    await detailsPage.requestDateField().fill('02/01/2001')
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Request received', '2 January 2001')

    await checkAnswersPage.clickLink('Change reason')
    await detailsPage.reasonInput().clear()
    await detailsPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change priority')
    await detailsPage.priorityLowRadio().click()
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Priority', 'Low')

    await checkAnswersPage.clickLink('Change date and time')
    await detailsPage.dateField().fill('30/12/2047')
    await detailsPage.hourField().fill('11')
    await detailsPage.minuteField().fill('30')
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Date and time', '30 December 2047 at 11:30')

    await checkAnswersPage.clickLink('Change destination')
    await detailsPage.destinationInput().clear()
    await detailsPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Destination (optional)', 'Prison Two')

    await checkAnswersPage.clickLink('Change escort details')
    await detailsPage.logisticsInput().clear()
    await detailsPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await detailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Escort details (optional)', 'Logistics Two')

    await checkAnswersPage.clickLink('Change comments')
    await detailsPage.commentsField().fill('Lorem ipsum')
    await detailsPage.clickContinue()
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
