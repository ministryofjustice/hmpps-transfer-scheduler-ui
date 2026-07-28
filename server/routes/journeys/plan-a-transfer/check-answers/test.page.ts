import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/check-answers/,
      title: 'Check your answers - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'Check your answers',
    })
  }
}
