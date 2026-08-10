import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/comments/,
      title: /Add any comments for this transfer - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'Add any comments for this transfer',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer')
  }
}
