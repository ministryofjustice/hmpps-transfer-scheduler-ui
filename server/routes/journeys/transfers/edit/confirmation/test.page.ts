import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/confirmation/,
      title: 'Change transfer confirmation - Manage scheduled transfers - DPS',
      heading: /Transfer .+/,
    })
  }
}
