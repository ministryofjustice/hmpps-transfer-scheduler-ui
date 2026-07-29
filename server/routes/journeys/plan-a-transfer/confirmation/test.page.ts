import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/confirmation/,
      title: 'Transfer planned - DPS',
      heading: 'Transfer planned for Prisoner-Name Prisoner-Surname',
    })
  }
}
