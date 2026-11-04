import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class TransferReportPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/(\w|-)+\/report/,
      title: 'Transfer report - Manage scheduled transfers - DPS',
      caption: 'Manage scheduled transfers',
      heading: 'Transfer report',
    })
  }
}
