import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferRequestDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/move-to-planning\/request-date/,
      title: 'When did you receive the transfer request - Manage transfers - DPS',
      caption: 'Manage transfers',
      heading: 'When did you receive the transfer request?',
    })
  }

  dateField() {
    return this.textbox(/When did you receive the transfer request\?/)
  }
}
