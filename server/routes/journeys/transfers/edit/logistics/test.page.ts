import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/logistics/,
      title: /What type of escorted transfer is this - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'What type of escorted transfer is this?',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  logisticsInput() {
    return this.dropdown('What type of escorted transfer is this?')
  }
}
