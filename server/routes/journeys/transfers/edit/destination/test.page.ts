import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferDestinationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/destination/,
      title: /Enter a destination for this prisoner - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: /Enter a destination for (.+?)/,
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  destinationInput() {
    return this.dropdown(/Enter a destination for (.+?)/)
  }
}
