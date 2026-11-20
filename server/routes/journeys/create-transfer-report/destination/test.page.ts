import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class CreateReportDestinationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/create-transfer-report\/destination/,
      title: 'Enter a destination for this prisoner - Create a transfer report - DPS',
      caption: 'Create a transfer report',
      heading: /Enter a destination for (.+?)/,
      backUrl: /select-transfer/,
    })
  }

  destinationInput() {
    return this.dropdown(/Enter a destination for (.+?)/)
  }
}
