import { test, expect } from '@playwright/test'
import auth from '../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../integration_tests/mockApis/componentsApi'
import { stubSearchPrisoner } from '../../../../integration_tests/mockApis/prisonerSearchApi'
import { stubGetPrisonerImage } from '../../../../integration_tests/mockApis/prisonApi'
import { ScheduleTransferSearchPrisonerPage } from './test.page'
import { login, resetStubs } from '../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../integration_tests/steps/testNotAuthorisedPage'

test.describe('/search-prisoner/schedule-a-transfer unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/search-prisoner/schedule-a-transfer')
  })
})

test.describe('/search-prisoner/schedule-a-transfer', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
      stubSearchPrisoner('LEI', '.+', {
        content: [
          {
            prisonerNumber: 'A1234EA',
            firstName: 'Name',
            lastName: 'One',
            cellLocation: 'Loc-1',
            prisonId: 'LEI',
            dateOfBirth: '',
            status: '',
            prisonName: '',
            restrictedPatient: false,
          },
          {
            prisonerNumber: 'A2345EA',
            firstName: 'Another',
            lastName: 'Two',
            cellLocation: 'Loc-2',
            prisonId: 'LEI',
            dateOfBirth: '',
            status: '',
            prisonName: '',
            restrictedPatient: false,
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
    await page.goto('/search-prisoner/schedule-a-transfer')

    // verify page content
    const testPage = await new ScheduleTransferSearchPrisonerPage(page).verifyContent()

    await expect(testPage.searchField()).toBeVisible()
    await expect(testPage.searchField()).toHaveValue('')
    await expect(testPage.button('Search')).toBeVisible()

    // verify validation error
    await testPage.clickButton('Search')
    await testPage.link('Enter a name or prison number').click()
    await expect(testPage.searchField()).toBeFocused()

    // verify successful search
    await testPage.searchField().fill('test')
    await testPage.clickButton('Search')

    await testPage.verifyTableRow(1, ['Name One', 'A1234EA', 'Loc-1'])
    await expect(testPage.link('Schedule a transfer for Name One')).toHaveAttribute(
      'href',
      /\/schedule-a-transfer\/start\/A1234EA/,
    )

    await testPage.verifyTableRow(2, ['Another Two', 'A2345EA', 'Loc-2'])
    await expect(testPage.link('Schedule a transfer for Another Two')).toHaveAttribute(
      'href',
      /\/schedule-a-transfer\/start\/A2345EA/,
    )
  })
})
