import { expect } from '@playwright/test'
import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class ManageTransferPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/(\w|-)+/,
      title: /Manage (scheduled|planned) transfer - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfer/,
      heading: /Manage .+ (scheduled|planned) transfer/,
    })
  }

  async verifyHistoryEntry(heading: string | RegExp, contents: (string | RegExp)[], changes: (string | RegExp)[]) {
    const headingElement = this.page.getByRole('heading', { name: heading })
    await expect(headingElement).toBeVisible()

    const entryElement = headingElement.locator('../..')

    for (const content of contents) {
      await expect(entryElement.getByText(content)).toBeVisible()
    }

    if (changes.length) await entryElement.getByText('View update details').click()
    for (const change of changes) {
      await expect(entryElement.getByText(change)).toBeVisible()
    }
  }
}
