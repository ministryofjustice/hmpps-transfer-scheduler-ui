import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/comments/,
      title: 'Add any comments for this transfer (optional) - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'Add any comments for this transfer (optional)',
      backUrl: /logistics/,
    })
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer (optional)')
  }
}
