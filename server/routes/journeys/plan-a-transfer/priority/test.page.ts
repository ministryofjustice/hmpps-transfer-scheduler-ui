import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferPriorityPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/priority/,
      title: 'What is the priority of this transfer - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'What is the priority of this transfer?',
      backUrl: /reason/,
    })
  }

  priorityRadio() {
    return this.radio('High')
  }
}
