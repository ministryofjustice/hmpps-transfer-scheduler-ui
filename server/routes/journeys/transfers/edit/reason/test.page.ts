import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferReasonPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/reason/,
      title: /Enter a reason for this transfer - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'Enter a reason for this transfer',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }
}
