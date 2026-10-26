import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferClashesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/clashes/,
      title: 'This prisoner has a conflict - Schedule a transfer - DPS',
      heading: 'This prisoner has a conflict',
    })
  }
}
