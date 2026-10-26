import { v4 as uuidV4 } from 'uuid'
import { test, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferClashesPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import {
  stubGetTransfer,
  stubGetTransferClashes,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetCourtAppearanceClashes } from '../../../../../../integration_tests/mockApis/courtAppearanceSchedulerApi'
import { stubGetTemporaryAbsenceClashes } from '../../../../../../integration_tests/mockApis/externalMovementsApi'

test.describe('/transfers/edit/clashes unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/clashes')
  })
})

test.describe('/transfers/edit/clashes', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
        plan: { requestedOn: '2001-01-01', comments: 'Lorem ipsum', priority: { code: '1', description: 'High' } },
        stage: 'PLANNING',
      }),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  test('should try all cases', async ({ page }) => {
    await login(page)

    await Promise.all([
      stubGetCourtAppearanceClashes([]),
      stubGetTemporaryAbsenceClashes([
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
      stubGetTransferClashes([]),
    ])

    const journeyId = uuidV4()
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/schedule-a-plan`)

    // verify page content
    const testPage = await new EditTransferClashesPage(page).verifyContent()

    await expect(page.getByText('Date: 1 January 2001')).toBeVisible()
    await expect(page.getByText('Time: 10:00')).toBeVisible()
    await expect(page.getByText('Schedule type: Temporary absence')).toBeVisible()
    await expect(page.getByText('Schedule reason: Police production')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute(
      'href',
      /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    )

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/transfers\/edit\/schedule-a-plan/)
  })
})
