import { expect, test } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails, stubSearchPrisoner } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { login } from '../../../../integration_tests/testUtils'
import { getApiBody, resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import {
  prisoner1,
  prisoner2,
  testPrisonerDetails,
  transfer1,
  transfer2,
} from '../../../../integration_tests/data/testData'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubPutBulkTransfers,
  stubSearchTransfers,
} from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { BulkEditTransfersSearchTransfersPage } from '../../bulk-edit-transfers/test.page'
import { BulkEditTransfersEditListPage } from './edit-list/test.page'
import { BulkEditTransferSearchPrisonerPage } from './search-prisoner/test.page'
import { BulkEditTransferDetailsPage } from './transfer-details/test.page'
import { BulkEditTransfersCheckAnswersPage } from './check-answers/test.page'
import { BulkEditTransferChangeDetailsPage } from './change-details/test.page'
import { BulkEditTransfersConfirmationPage } from './confirmation/test.page'

test.describe('/bulk-edit-transfers e2e ', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubSearchPrisoner('LEI', '.+', {
        content: [prisoner1, prisoner2, testPrisonerDetails],
      }),
      stubGetPrisonerDetails(prisoner1),
      stubGetPrisonerDetails(prisoner2),
      stubGetPrisonerDetails(testPrisonerDetails),
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

  test('should bulk edit scheduled transfer list', async ({ page }) => {
    await page.goto(`/bulk-edit-transfers`)
    const startPage = await new BulkEditTransfersSearchTransfersPage(page).verifyContent()
    await startPage.clickButton('Create list')

    // fill in all pages
    const editListPage = await new BulkEditTransfersEditListPage(page).verifyContent()
    await editListPage.dateField().fill('31/12/2047')
    await editListPage.hourField().fill('10')
    await editListPage.minuteField().fill('00')
    await editListPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await editListPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await editListPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await editListPage.clickButton('Add another prisoner')

    const searchPrisonersPage = await new BulkEditTransferSearchPrisonerPage(page).verifyContent()
    await searchPrisonersPage.searchField().fill('test')
    await searchPrisonersPage.clickButton('Search')
    await searchPrisonersPage.clickLink('Add to list (Prisoner-Surname, Prisoner-Name)')

    const detailsPage = await new BulkEditTransferDetailsPage(page).verifyContent()
    await detailsPage.clickContinue()
    await editListPage.clickButton('Apply edits')

    const checkAnswersPage = await new BulkEditTransfersCheckAnswersPage(page).verifyContent()
    await checkAnswersPage.verifyAnswer('Date', '31 December 2047')
    await checkAnswersPage.verifyAnswer('Time', '10:00')
    await checkAnswersPage.verifyAnswer('Destination', 'Prison One')
    await checkAnswersPage.verifyAnswer('Reason', 'Reason One')
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics One')
    await checkAnswersPage.verifyAnswer('Comments', 'Not provided')

    // verify changing answers
    await checkAnswersPage.clickLink('Change bulk transfer list details')
    await editListPage.dateField().fill('30/12/2047')
    await editListPage.hourField().fill('11')
    await editListPage.minuteField().fill('30')
    await editListPage.destinationInput().clear()
    await editListPage.destinationInput().click()
    await page.getByText('Prison Two').first().click()
    await editListPage.logisticsInput().clear()
    await editListPage.logisticsInput().click()
    await page.getByText('Logistics Two').first().click()
    await editListPage.clickButton('Apply edits')

    await checkAnswersPage.verifyAnswer('Date', '30 December 2047')
    await checkAnswersPage.verifyAnswer('Time', '11:30')
    await checkAnswersPage.verifyAnswer('Destination', 'Prison Two')
    await checkAnswersPage.verifyAnswer('Escort details', 'Logistics Two')

    await checkAnswersPage.clickLink('Change reason for Prisoner-Name Prisoner-Surname')
    const changeDetailsPage = await new BulkEditTransferChangeDetailsPage(page).verifyContent()
    await changeDetailsPage.reasonInput().clear()
    await changeDetailsPage.reasonInput().click()
    await page.getByText('Reason Two').first().click()
    await changeDetailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Reason', 'Reason Two')

    await checkAnswersPage.clickLink('Change comments for Prisoner-Name Prisoner-Surname')
    await changeDetailsPage.commentsField().fill('Lorem ipsum')
    await changeDetailsPage.clickContinue()
    await checkAnswersPage.verifyAnswer('Comments', 'Lorem ipsum')

    // verify changing prisoners
    await checkAnswersPage.clickLink('Change prisoners in this bulk transfer')
    await editListPage.checkbox('Select Name One').click()
    await editListPage.clickButton('Apply edits')
    await expect(page.getByRole('heading', { name: 'One, Name' })).toBeVisible()

    // proceed to confirmation
    await checkAnswersPage.clickButton('Confirm edits')

    await new BulkEditTransfersConfirmationPage(page).verifyContent()

    expect(await getApiBody('/transfer-scheduler-api/bulk/transfers', 'PUT')).toContainEqual({
      transfers: [
        {
          id: expect.any(String),
          personIdentifier: 'A1234EA',
          start: '2047-12-30T11:30:00',
          destinationCode: 'P2',
          reasonCode: 'R1',
          logisticsCode: 'L2',
          statusCode: 'SCHEDULED',
        },
        {
          id: expect.any(String),
          personIdentifier: 'A9965EA',
          start: '2047-12-30T11:30:00',
          destinationCode: 'P2',
          reasonCode: 'R1',
          logisticsCode: 'L2',
          comments: 'Lorem ipsum',
          statusCode: 'SCHEDULED',
        },
      ],
    })
  })
})
