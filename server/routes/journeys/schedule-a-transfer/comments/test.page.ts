import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferCommentsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/comments/,
      title: 'Add any comments for this transfer (optional) - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Add any comments for this transfer (optional)',
      backUrl: /logistics/,
    })
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer (optional)')
  }
}
