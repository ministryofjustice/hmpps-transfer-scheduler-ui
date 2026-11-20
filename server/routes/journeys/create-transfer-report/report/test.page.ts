import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class CreateReportShareLinkPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/create-transfer-report\/report/,
      title: 'Transfer report - Create a transfer report - DPS',
      caption: 'Create a transfer report',
      heading: 'Transfer report',
      backUrl: /destination/,
    })
  }
}
