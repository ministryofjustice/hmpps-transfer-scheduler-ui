import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferReasonPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/reason/,
      title: 'Enter a reason for this transfer - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'Enter a reason for this transfer',
      backUrl: /request-date/,
    })
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }
}
