import { expect, Page, test } from '@playwright/test'
import { v4 as uuidV4 } from 'uuid'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { stubGetPrisonerDetails } from '../../../../../integration_tests/mockApis/prisonerSearchApi'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testPrisonerDetails } from '../../../../../integration_tests/data/testData'
import { CreateReportDestinationPage } from './test.page'
import { stubSearchTransfersByPerson } from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'

test.describe('/create-transfer-report/destination', () => {
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
      stubGetPrisons(),
    ])
    await login(page)
  })

  test.afterEach(async () => {
    await resetStubs()
  })

  const startJourney = async (page: Page, journeyId: string) => {
    await page.goto(`/${journeyId}/create-transfer-report/start/${testPrisonerDetails.prisonerNumber}`)
    await page.goto(`/${journeyId}/create-transfer-report/destination`)
  }

  test('should select a destination to create transfer report', async ({ page }) => {
    await await startJourney(page, uuidV4())

    // verify page content
    const testPage = await new CreateReportDestinationPage(page).verifyContent()

    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.destinationInput()).toHaveValue('')
    await expect(testPage.continueButton()).toBeVisible()

    // verify validation error
    await testPage.clickContinue()
    await testPage.link('Enter and select a prison').click()
    await expect(testPage.destinationInput()).toBeFocused()

    // verify next page routing
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.clickContinue()
    expect(page.url()).toMatch(/\/create-transfer-report\/report/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
  })
})
