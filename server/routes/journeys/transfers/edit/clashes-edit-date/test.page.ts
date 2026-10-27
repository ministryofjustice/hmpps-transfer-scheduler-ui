import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferClashesEditDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/clashes-edit-date/,
      title: /This prisoner has a conflict - Manage (scheduled|planned) transfers - DPS/,
      heading: 'This prisoner has a conflict',
    })
  }
}
