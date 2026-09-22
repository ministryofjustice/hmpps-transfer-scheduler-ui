import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/logistics/,
      title: 'Which escort type is being used for this transfer - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Which escort type is being used for this transfer?',
      backUrl: /reason/,
    })
  }

  logisticsInput() {
    return this.dropdown('Which escort type is being used for this transfer?')
  }
}
