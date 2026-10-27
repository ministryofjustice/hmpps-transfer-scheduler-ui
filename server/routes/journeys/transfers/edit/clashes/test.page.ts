import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferClashesPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/clashes/,
      title: /This prisoner has a conflict - Manage (scheduled|planned) transfers - DPS/,
      heading: 'This prisoner has a conflict',
    })
  }
}
