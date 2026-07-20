import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferLogisticsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/logistics/,
      title: 'What type of escorted transfer is this (optional) - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'What type of escorted transfer is this? (optional)',
      backUrl: /destination/,
    })
  }

  logisticsInput() {
    return this.dropdown('What type of escorted transfer is this? (optional)')
  }
}
