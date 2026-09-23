import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/logistics/,
      title: 'Which escort type is being used for this transfer (optional) - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'Which escort type is being used for this transfer? (optional)',
      backUrl: /destination/,
    })
  }

  logisticsInput() {
    return this.dropdown('Which escort type is being used for this transfer? (optional)')
  }
}
