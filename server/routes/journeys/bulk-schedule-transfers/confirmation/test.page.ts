import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkScheduleTransfersConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-schedule-transfers\/confirmation/,
      title: 'Scheduled transfer list created - DPS',
      heading: 'Scheduled transfer list created',
    })
  }
}
