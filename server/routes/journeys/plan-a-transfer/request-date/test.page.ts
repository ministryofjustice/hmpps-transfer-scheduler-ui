import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferRequestDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/request-date/,
      title: 'When did you receive the transfer request - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'When did you receive the transfer request?',
    })
  }

  dateField() {
    return this.textbox(/When did you receive the transfer request\?/)
  }
}
