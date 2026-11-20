import { expect, Page, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { CreateReportSelectTransferPage } from './test.page'
import { stubSearchTransfersByPerson } from '../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/create-transfer-report/select-transfer', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([auth.stubSignInPage(), stubComponents(), stubGetPrisonerImage(), stubGetPrisonerDetails()])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/create-transfer-report/start/${testPrisonerDetails.prisonerNumber}`)
    await page.goto(`/${journeyId}/create-transfer-report/select-transfer`)
  }

  test('should show select transfer page', async ({ page }) => {
    await stubSearchTransfersByPerson(
      {
        metadata: { totalElements: 11 },
        content: [
          {
            id: 'transfer-1',
            person: {
              identifier: 'A9965EA',
              firstName: 'PRISONER-NAME',
              lastName: 'PRISONER-SURNAME',
              cellLocation: '1-2-34',
            },
            prison: {
              code: 'LEI',
              name: 'LEEDS',
            },
            status: { code: 'SCHEDULED', description: 'Scheduled' },
            schedule: {
              start: '2001-01-01T10:00:00',
            },
            destination: { code: 'P1', name: 'Prison One' },
            reason: { code: 'R1', description: 'Reason One' },
            logistics: { code: 'L1', description: 'Logistics One' },
            stage: 'SCHEDULED',
          },
        ],
      },
      testPrisonerDetails.prisonerNumber,
    )
    await startJourney(page, uuidV4())

    // verify page content
    const testPage = await new CreateReportSelectTransferPage(page).verifyContent()

    await expect(page.getByText('Showing 1 to 1 of 11 total results')).toHaveCount(2)
    await testPage.verifyTableRow(1, [
      '1 January 2001 at 10:00',
      'Prison One',
      'Reason One',
      'Logistics One',
      'Scheduled',
    ])

    await expect(testPage.link('Select transfer dated on 1 January 2001')).toHaveAttribute(
      'href',
      /\/transfers\/transfer-1\/report/,
    )

    // verify next page routing
    await testPage.clickButton('Create report without transfer')
    expect(page.url()).toMatch(/\/create-transfer-report\/destination/)
  })

  test('should show fallback option to create a report without a transfer page', async ({ page }) => {
    await stubSearchTransfersByPerson(
      {
        metadata: { totalElements: 0 },
        content: [],
      },
      testPrisonerDetails.prisonerNumber,
    )
    await startJourney(page, uuidV4())

    // verify page content
    const testPage = await new CreateReportSelectTransferPage(page).verifyContent()
    await expect(
      page.getByText(
        'Continue to create a transfer report without scheduling a transfer. You will need to select a destination prison.',
      ),
    ).toBeVisible()

    // verify next page routing
    await testPage.clickButton('Create report without transfer')
    expect(page.url()).toMatch(/\/create-transfer-report\/destination/)
  })
})
