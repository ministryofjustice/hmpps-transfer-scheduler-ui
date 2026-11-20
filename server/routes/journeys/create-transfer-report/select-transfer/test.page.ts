import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class CreateReportSelectTransferPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/create-transfer-report\/select-transfer/,
      title: 'Select a scheduled or planned transfer to create a report - Create a transfer report - DPS',
      caption: 'Create a transfer report',
      heading: 'Select a scheduled or planned transfer to create a report',
    })
  }
}
