import { expect, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails, stubSearchPrisoner } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { prisoner1, prisoner2 } from '../../../../integration_tests/data/testData'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubPutBulkTransfers,
} from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { BulkScheduleTransferSearchPrisonerPage } from './search-prisoners/test.page'
import { BulkScheduleTransferDetailsPage } from './transfer-details/test.page'
import { BulkScheduleTransfersCheckAnswersPage } from './check-answers/test.page'
import { BulkScheduleTransfersConfirmationPage } from './confirmation/test.page'

test.describe('/bulk-schedule-transfers e2e ', () => {
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
      stubPutBulkTransfers(),
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

  test('should create bulk scheduled transfer list', async ({ page }) => {
    const journeyId = uuidV4()
    await page.goto(`/${journeyId}/bulk-schedule-transfers`)

    // fill in all pages
    const searchPrisonersPage = await new BulkScheduleTransferSearchPrisonerPage(page).verifyContent()
    await searchPrisonersPage.searchField().fill('test')
    await searchPrisonersPage.clickButton('Search')
    await searchPrisonersPage.clickLink('Add to bulk list (One, Name)')
    await searchPrisonersPage.clickContinue()

    const detailsPage = await new BulkScheduleTransferDetailsPage(page).verifyContent()
    await detailsPage.dateField().fill('31/12/2047')
    await detailsPage.hourField().fill('10')
    await detailsPage.minuteField().fill('00')
    await detailsPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await detailsPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await detailsPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await detailsPage.clickButton('Save and next')

    const checkAnswersPage = await new BulkScheduleTransfersCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Date', '31 December 2047')
    await checkAnswersPage.verifyAnswer('Time', '10:00')
    await checkAnswersPage.verifyAnswer('Destination', 'Prison One')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics One')
    await checkAnswersPage.verifyAnswer('Comments', 'Not provided')

    // verify changing answers
    await checkAnswersPage.clickLink('Change date for Name One')
    await detailsPage.dateField().fill('30/12/2047')
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Date', '30 December 2047')

    await checkAnswersPage.clickLink('Change time for Name One')
    await detailsPage.hourField().fill('11')
    await detailsPage.minuteField().fill('30')
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Time', '11:30')

    await checkAnswersPage.clickLink('Change destination for Name One')
    await detailsPage.destinationInput().clear()
    await detailsPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Destination', 'Prison Two')

    await checkAnswersPage.clickLink('Change reason for Name One')
    await detailsPage.reasonInput().clear()
    await detailsPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change escort details for Name One')
    await detailsPage.logisticsInput().clear()
    await detailsPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics Two')

    await checkAnswersPage.clickLink('Change comments for Name One')
    await detailsPage.commentsField().fill('Lorem ipsum')
    await detailsPage.clickButton('Save and next')
    await checkAnswersPage.verifyAnswer('Comments', 'Lorem ipsum')

    // verify changing prisoners
    await checkAnswersPage.clickLink('Change prisoners in this bulk transfer')
    await searchPrisonersPage.clickLink('Add to bulk list (Two, Another)')
    await searchPrisonersPage.clickContinue()
    await detailsPage.clickButton('Save and next')
    await expect(page.getByRole('heading', { name: 'Two, Another' })).toBeVisible()

    // proceed to confirmation
    await checkAnswersPage.clickButton('Confirm and save')

    await new BulkScheduleTransfersConfirmationPage(page).verifyContent()

    expect(await getApiBody('/transfer-scheduler-api/bulk/transfers', 'PUT')).toContainEqual({
      transfers: [
        {
          id: expect.any(String),
          personIdentifier: 'A1234EA',
          start: '2047-12-30T11:30:00',
          destinationCode: 'P2',
          reasonCode: 'R2',
          logisticsCode: 'L2',
          comments: 'Lorem ipsum',
          statusCode: 'SCHEDULED',
        },
        {
          id: expect.any(String),
          personIdentifier: 'A2345EA',
          start: '2047-12-31T10:00:00',
          destinationCode: 'P1',
          reasonCode: 'R1',
          logisticsCode: 'L1',
          statusCode: 'SCHEDULED',
        },
      ],
    })
  })
})
