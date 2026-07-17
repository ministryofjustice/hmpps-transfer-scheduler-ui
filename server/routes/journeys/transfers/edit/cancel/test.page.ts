import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class TransferCancelPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/cancel/,
      title: 'Are you sure you want to cancel this transfer - Manage scheduled transfers - DPS',
      caption: 'Manage scheduled transfers',
      heading: /Are you sure you want to cancel this transfer\?/,
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }

  reasonField() {
    return this.textbox('Enter a reason for cancelling this transfer (optional)')
  }
}
