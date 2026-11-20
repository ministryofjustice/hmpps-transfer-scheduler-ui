import { Page, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNonAssociationResponse, testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { CreateReportShareLinkPage } from './test.page'
import { stubSearchTransfersByPerson } from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetNonAssociations } from '../../../../../integration_tests/mockApis/nonAssociationsApi'
import { stubGetPrisonerAlerts } from '../../../../../integration_tests/mockApis/prisonerAlertsApi'
import { stubSearchCaseNotes } from '../../../../../integration_tests/mockApis/caseNotesApi'
import { TransferShareReportPage } from '../../../share-report/test.page'

test.describe('/create-transfer-report/report', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubSearchTransfersByPerson(
        {
          metadata: { totalElements: 0 },
          content: [],
        },
        testPrisonerDetails.prisonerNumber,
      ),
      stubGetNonAssociations(testNonAssociationResponse),
      stubGetPrisonerAlerts(),
      stubSearchCaseNotes(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/create-transfer-report/start/${testPrisonerDetails.prisonerNumber}`)
    await injectJourneyData(page, journeyId, {
      createTransferReport: {
        backUrl: 'backUrl',
        historyQuery: '',
        destination: { code: 'P1', description: 'Prison One' },
      },
    })
    await page.goto(`/${journeyId}/create-transfer-report/report`)
  }

  test('should create transfer report without a report', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await await startJourney(page, uuidV4())

    // verify page content
    const testPage = await new CreateReportShareLinkPage(page).verifyContent()

    // create and copy share link
    await testPage.clickButton('Create report link')
    await testPage.clickButton('Copy')

    const clipboardContent = await page
      .evaluateHandle(() => navigator.clipboard.readText())
      .then(handle => handle.jsonValue())

    // verify shared report
    await page.goto(clipboardContent)
    await new TransferShareReportPage(page).verifyContent()
  })
})
