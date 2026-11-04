import { test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisons } from '../../../../integration_tests/mockApis/prisonRegisterApi'
import { resetStubs } from '../../../../integration_tests/mockApis/wiremock'
import { login } from '../../../../integration_tests/testUtils'
import { stubGetTransfer } from '../../../../integration_tests/mockApis/transferSchedulerApi'
import { testNonAssociationResponse, testTransfer } from '../../../../integration_tests/data/testData'
import { TransferReportPage } from './test.page'
import { stubGetNonAssociations } from '../../../../integration_tests/mockApis/nonAssociationsApi'
import { stubGetPrisonerAlerts } from '../../../../integration_tests/mockApis/prisonerAlertsApi'
import { stubSearchCaseNotes } from '../../../../integration_tests/mockApis/caseNotesApi'
import { TransferShareReportPage } from '../../share-report/test.page'

test.describe('/transfers/:id/report', () => {
  test.beforeEach(async () => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetNonAssociations(testNonAssociationResponse),
      stubGetPrisonerAlerts(),
      stubSearchCaseNotes(),
    ])
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should create share report', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await login(page)
    const transferId = uuidV4()
    await stubGetTransfer({
      ...testTransfer,
      id: transferId,
      plan: { requestedOn: '1999-12-01', priority: { code: '2', description: 'Medium' } },
      stage: 'SCHEDULED',
    })

    await page.goto(`/transfers/${transferId}/report`)

    // verify page content
    const testPage = await new TransferReportPage(page).verifyContent()

    await testPage.verifyAnswer('Date and time', '1 January 2001 at 09:15')
    await testPage.verifyAnswer('Transferred from', 'Leeds')
    await testPage.verifyAnswer('Destination', 'Prison One')
    await testPage.verifyAnswer('Reason', 'Reason One')
    await testPage.verifyAnswer('Escort details', 'Logistics One')
    await testPage.verifyAnswer('Comments', 'Lorem ipsum')
    await testPage.verifyAnswer('Status', 'Scheduled')

    // create and copy share link
    await testPage.clickButton('Create report link')
    await testPage.clickButton('Copy')

    const clipboardContent = await page
      .evaluateHandle(() => navigator.clipboard.readText())
      .then(handle => handle.jsonValue())

    // verify shared report
    await page.goto(clipboardContent)

    const shareReportPage = await new TransferShareReportPage(page).verifyContent()

    await shareReportPage.verifyAnswer('Date and time', '1 January 2001 at 09:15')
    await shareReportPage.verifyAnswer('Transferred from', 'Leeds')
    await shareReportPage.verifyAnswer('Destination', 'Prison One')
    await shareReportPage.verifyAnswer('Reason', 'Reason One')
    await shareReportPage.verifyAnswer('Escort details', 'Logistics One')
    await shareReportPage.verifyAnswer('Comments', 'Lorem ipsum')
    await shareReportPage.verifyAnswer('Status', 'Scheduled')
  })
})
