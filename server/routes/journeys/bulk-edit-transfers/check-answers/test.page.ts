import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransfersCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/check-answers/,
      title: 'Check your edits - Edit scheduled transfers in bulk',
      caption: 'Edit scheduled transfers in bulk',
      heading: 'Check your edits',
    })
  }
}
