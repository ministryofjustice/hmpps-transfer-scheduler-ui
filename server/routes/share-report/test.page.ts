import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class TransferShareReportPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/share-report\/(\w|-)+/,
      title: 'Transfer report - DPS',
      heading: 'Transfer report',
    })
  }
}
