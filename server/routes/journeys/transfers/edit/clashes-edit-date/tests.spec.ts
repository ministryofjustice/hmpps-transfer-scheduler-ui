import { v4 as uuidV4 } from 'uuid'
import { test, expect } from '@playwright/test'
import auth from '../../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerDetails } from '../../../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../../../integration_tests/mockApis/prisonApi'
import { EditTransferClashesEditDatePage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../../integration_tests/steps/testNotAuthorisedPage'
import { testTransfer } from '../../../../../../integration_tests/data/testData'
import { login, resetStubs } from '../../../../../../integration_tests/testUtils'
import {
  stubGetTransfer,
  stubGetTransferClashes,
  stubGetTransferHistory,
  stubPutTransfer,
} from '../../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetCourtAppearanceClashes } from '../../../../../../integration_tests/mockApis/courtAppearanceSchedulerApi'
import { stubGetTemporaryAbsenceClashes } from '../../../../../../integration_tests/mockApis/externalMovementsApi'
import { EditTransferDateTimePage } from '../date-and-time/test.page'
import { formatInputDate } from '../../../../../utils/dateTimeUtils'
import { getApiBody } from '../../../../../../integration_tests/mockApis/wiremock'
import { stubGetPrisons } from '../../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/transfers/edit/clashes-edit-date unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/transfers/edit/clashes-edit-date')
  })
})

test.describe('/transfers/edit/clashes-edit-date', () => {
  const transferId = uuidV4()

  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisons(),
      stubGetPrisonerImage(),
      stubGetPrisonerDetails(),
      stubGetTransfer({
        ...testTransfer,
        id: transferId,
        plan: { requestedOn: '2001-01-01', comments: 'Lorem ipsum', priority: { code: '1', description: 'High' } },
        stage: 'SCHEDULED',
      }),
      stubGetTransferHistory(transferId, { content: [] }),
      stubPutTransfer(transferId, {
        content: [
          {
            user: { username: 'USERNAME', name: 'User Name' },
            occurredAt: '2025-12-01T17:50:20.421301',
            domainEvents: ['person.transfer.rescheduled'],
            changes: [{ propertyName: '', previous: '', change: '' }],
          },
        ],
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
    await page.goto(`${journeyId}/transfers/start-edit/${transferId}/date-and-time`)

    // enter date and time
    const dateTimePage = await new EditTransferDateTimePage(page).verifyContent()
    const today = formatInputDate(new Date().toISOString())!
    await dateTimePage.dateField().fill(today)
    await dateTimePage.hourField().fill('23')
    await dateTimePage.minuteField().fill('59')
    await dateTimePage.clickButton('Save')

    // verify page content
    const testPage = await new EditTransferClashesEditDatePage(page).verifyContent()

    await expect(page.getByText('Date: 1 January 2001')).toBeVisible()
    await expect(page.getByText('Time: 10:00')).toBeVisible()
    await expect(page.getByText('Schedule type: Temporary absence')).toBeVisible()
    await expect(page.getByText('Schedule reason: Police production')).toBeVisible()
    await expect(testPage.button('Continue')).toBeVisible()
    await expect(testPage.link('Go back')).toHaveAttribute('href', /date-and-time/)

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/)

    expect(page.getByText('Transfer date and time changed')).toBeVisible()

    // verify API call
    expect(await getApiBody(`/transfer-scheduler-api/transfers/${transferId}`, 'PUT')).toContainEqual({
      actions: [{ type: 'ApplyScheduleStart', start: expect.any(String) }],
    })
  })
})
