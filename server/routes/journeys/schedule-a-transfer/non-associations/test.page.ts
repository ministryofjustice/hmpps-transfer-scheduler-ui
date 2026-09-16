import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferNonAssociationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/non-associations/,
      title: 'This prisoner has a non-association - Schedule a transfer - DPS',
      heading: 'This prisoner has a non-association',
    })
  }
}
