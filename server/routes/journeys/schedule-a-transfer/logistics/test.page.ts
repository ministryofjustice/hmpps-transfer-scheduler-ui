import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/logistics/,
      title: 'What type of escorted transfer is this - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'What type of escorted transfer is this?',
      backUrl: /reason/,
    })
  }

  logisticsInput() {
    return this.dropdown('What type of escorted transfer is this?')
  }
}
