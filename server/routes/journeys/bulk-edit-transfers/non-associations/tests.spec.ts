import { expect, test, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { BulkEditTransfersNonAssociationPage } from './test.page'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { injectJourneyData } from '../../../../../integration_tests/steps/journey'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import { transfer1, transfer2 } from '../../../../../integration_tests/data/testData'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'

test.describe('/bulk-edit-transfers/non-associations unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/non-associations')
  })
})

test.describe('/bulk-edit-transfers/non-associations', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubSearchTransfers({ metadata: { totalElements: 2 }, content: [transfer1, transfer2] }),
      stubGetPrisons(),
      stubGetReasons(),
      stubGetLogistics(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page) => {
    await page.goto('/bulk-edit-transfers?start=01/01/2001&end=31/01/2001')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!
    await injectJourneyData(page, journeyId, {
      bulkEditTransfer: {
        transfers: [],
        selectedTransfers: [],
        nonAssociations: [
          {
            prisoner: transfer1.person,
            destination: 'Prison One',
            otherPrisoners: [
              {
                prisonerNumber: 'Z1111ZZ',
                role: 'VICTIM',
                roleDescription: '',
                firstName: 'ANOTHER-NAME',
                lastName: 'ANOTHER-SURNAME',
              },
            ],
          },
        ],
      },
    })
    await page.goto(`/${journeyId}/bulk-edit-transfers/non-associations`)
  }

  test('should show non-association for bulk-edit-transfers', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransfersNonAssociationPage(page).verifyContent()

    await expect(testPage.link('Edit list of prisoners')).toBeVisible()
    await expect(testPage.link('Edit list of prisoners')).toHaveAttribute('href', /edit-list/)
    await expect(testPage.button('Continue')).toBeVisible()

    await expect(page.getByText('Name One has a non-association at Prison One with:')).toBeVisible()
    await expect(page.getByText('Another-Surname, Another-Name')).toBeVisible()

    // verify next page routing
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/bulk-edit-transfers\/check-answers/)
  })
})
