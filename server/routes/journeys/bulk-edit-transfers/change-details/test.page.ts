import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransferChangeDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/change-details/,
      title: 'Enter transfer details - Edit scheduled transfers in bulk - DPS',
      caption: 'Edit scheduled transfers in bulk',
      heading: /Enter the details for (.+?)/,
      backUrl: /check-answers/,
    })
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer (optional)')
  }
}
