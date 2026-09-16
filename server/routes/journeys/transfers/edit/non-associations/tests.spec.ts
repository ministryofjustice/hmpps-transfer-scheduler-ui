import { v4 as uuidV4 } from 'uuid'
import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferNonAssociationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetTransfer,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'

test.describe('/transfers/edit/non-associations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/non-associations')
  })
})

test.describe('/transfers/edit/non-associations', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetPrisons(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
      }),
      stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, { content: [] }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/destination`)
    await injectJourneyData(page, journeyId, {
      updateTransfer: {
        backUrl: `/transfers/${transferId}`,
        historyQuery: 'history',
        transfer: { ...testTransfer, id: transferId, label: 'scheduled transfer' },
        destination: { code: 'P2', description: 'Prison Two' },
        nonAssociations: [
          {
            prisonerNumber: 'Z1111ZZ',
            role: 'VICTIM',
            roleDescription: '',
            firstName: 'ANOTHER-NAME',
            lastName: 'ANOTHER-SURNAME',
          },
        ],
      },
    })
    await page.goto(`/${journeyId}/transfers/edit/non-associations`)
  }

  test('should continue to change transfer destination with a non-association', async ({ page }) => {
    const journeyId = uuidV4()
    await startJourney(page, journeyId)

    // verify page content
    const testPage = await new ScheduleTransferNonAssociationPage(page).verifyContent()

    await expect(testPage.link('Go back')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute('href', /destination/)
    await expect(testPage.button('Continue')).toBeVisible()

    await expect(
      page.getByText('Prisoner-Name Prisoner-Surname has a non-association at Prison Two with:'),
    ).toBeVisible()
    await expect(page.getByText('Another-Surname, Another-Name')).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()

    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer destination changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyDestination', destinationCode: 'P2' }],
    })
  })
})
