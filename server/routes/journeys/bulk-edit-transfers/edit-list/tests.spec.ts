import { test, expect, Page } from '@playwright/test'
import auth from '../../../../../integration_tests/mockApis/hmppsAuth'
import { stubComponents } from '../../../../../integration_tests/mockApis/componentsApi'
import { stubGetPrisonerImage } from '../../../../../integration_tests/mockApis/prisonApi'
import { BulkEditTransfersEditListPage } from './test.page'
import { login, resetStubs } from '../../../../../integration_tests/testUtils'
import { testNotAuthorisedPage } from '../../../../../integration_tests/steps/testNotAuthorisedPage'
import { stubGetPrisons } from '../../../../../integration_tests/mockApis/prisonRegisterApi'
import {
  stubGetLogistics,
  stubGetReasons,
  stubSearchTransfers,
} from '../../../../../integration_tests/mockApis/transferSchedulerApi'
import { formatInputDate } from '../../../../utils/dateTimeUtils'
import { stubGetNonAssociations } from '../../../../../integration_tests/mockApis/nonAssociationsApi'
import { testNonAssociationResponse, transfer1, transfer2 } from '../../../../../integration_tests/data/testData'

test.describe('/bulk-edit-transfers/edit-list unauthorised', () => {
  test('should show unauthorised error', async ({ page }) => {
    await testNotAuthorisedPage(page, '/bulk-edit-transfers/edit-list/PRISON_NUMBER')
  })
})

test.describe('/bulk-edit-transfers/edit-list', () => {
  test.beforeEach(async ({ page }) => {
    await Promise.all([
      auth.stubSignInPage(),
      stubComponents(),
      stubGetPrisonerImage(),
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
    await page.goto('/bulk-edit-transfers')
    await page.getByRole('button', { name: 'Create list' }).click()
    const journeyId = (await page.url()).split('/')[3]!

    await page.goto(`/${journeyId}/bulk-edit-transfers/edit-list`)
  }

  test('should bulk edit transfers and proceed to check answers', async ({ page }) => {
    await startJourney(page)

    await stubGetNonAssociations({
      closedCount: '',
      firstName: '',
      lastName: '',
      nonAssociations: [],
      openCount: '',
      prisonerNumber: '',
    })

    // verify page content
    const testPage = await new BulkEditTransfersEditListPage(page).verifyContent()
    await expect(testPage.dateField()).toBeVisible()
    await expect(testPage.hourField()).toBeVisible()
    await expect(testPage.minuteField()).toBeVisible()
    await expect(testPage.destinationInput()).toBeVisible()
    await expect(testPage.reasonInput()).toBeVisible()
    await expect(testPage.logisticsInput()).toBeVisible()
    await expect(testPage.commentsField()).toBeVisible()
    await expect(testPage.button('Add another prisoner')).toBeVisible()
    await expect(testPage.button('Apply edits')).toBeVisible()

    // verify validation error
    await testPage.button('Apply edits').click()
    await testPage.link('Select transfers to be edited').click()
    await expect(testPage.checkbox('Select Name One')).toBeFocused()
    await testPage.link('Select at least one set of details to edit').click()
    await expect(testPage.dateField()).toBeFocused()

    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.commentsField().fill('n'.repeat(226))
    await testPage.button('Apply edits').click()
    await testPage.link('Enter a transfer time').click()
    await expect(testPage.hourField()).toBeFocused()
    await testPage.link('The maximum character limit for comments is 225').click()
    await expect(testPage.commentsField()).toBeFocused()

    // verify next page routing
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.destinationInput().click()
    await page.getByText('Prison One').first().click()
    await testPage.reasonInput().click()
    await page.getByText('Reason One').first().click()
    await testPage.logisticsInput().click()
    await page.getByText('Logistics One').first().click()
    await testPage.commentsField().fill('Lorem ipsum')
    await testPage.link('Select all').click()
    await testPage.button('Apply edits').click()

    expect(page.url()).toMatch(/\/bulk-edit-transfers\/check-answers/)

    // verify input values are persisted
    await page.goBack()
    await page.reload()
    await expect(testPage.dateField()).toHaveValue(today)
    await expect(testPage.hourField()).toHaveValue('23')
    await expect(testPage.minuteField()).toHaveValue('59')
    await expect(testPage.destinationInput()).toHaveValue('Prison One')
    await expect(testPage.reasonInput()).toHaveValue('Reason One')
    await expect(testPage.logisticsInput()).toHaveValue('Logistics One')
    await expect(testPage.commentsField()).toHaveValue('Lorem ipsum')
    await expect(testPage.checkbox('Select Name One')).toBeChecked()
    await expect(testPage.checkbox('Select Another Two')).toBeChecked()
  })

  test('should bulk edit transfers and proceed to non-associations page', async ({ page }) => {
    await startJourney(page)

    await stubGetNonAssociations(testNonAssociationResponse)

    // verify page content
    const testPage = await new BulkEditTransfersEditListPage(page).verifyContent()

    // enter details
    const today = formatInputDate(new Date().toISOString())!
    await testPage.dateField().fill(today)
    await testPage.hourField().fill('23')
    await testPage.minuteField().fill('59')
    await testPage.link('Select all').click()

    // verify next page routing
    await testPage.button('Apply edits').click()
    expect(page.url()).toMatch(/\/bulk-edit-transfers\/non-associations/)
  })

  test('should allow empty input and proceed to search-prisoner page', async ({ page }) => {
    await startJourney(page)

    // verify page content
    const testPage = await new BulkEditTransfersEditListPage(page).verifyContent()

    // verify next page routing
    await testPage.button('Add another prisoner').click()
    expect(page.url()).toMatch(/\/bulk-edit-transfers\/search-prisoner/)
  })
})
