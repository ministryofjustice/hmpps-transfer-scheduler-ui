import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransfersConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/confirmation/,
      title: 'Scheduled transfer list updated - DPS',
      heading: 'Scheduled transfer list updated',
    })
  }
}
