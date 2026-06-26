import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferReasonPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/reason/,
      title: 'Enter a reason for this transfer - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Enter a reason for this transfer',
      backUrl: /destination/,
    })
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }
}
