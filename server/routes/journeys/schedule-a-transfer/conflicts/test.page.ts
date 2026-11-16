import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferConflictsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/conflicts/,
      title: 'This prisoner has a conflict - Schedule a transfer - DPS',
      heading: 'This prisoner has a conflict',
    })
  }
}
