import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/logistics/,
      title: /Which escort type is being used for this transfer - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'Which escort type is being used for this transfer?',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  logisticsInput() {
    return this.dropdown('Which escort type is being used for this transfer?')
  }
}
