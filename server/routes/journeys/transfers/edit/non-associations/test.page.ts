import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferNonAssociationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/non-associations/,
      title: 'This prisoner has a non-association - Manage scheduled transfers - DPS',
      heading: 'This prisoner has a non-association',
    })
  }
}
