import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferRequestDatePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/request-date/,
      title: /When did you receive the transfer request - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'When did you receive the transfer request?',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  dateField() {
    return this.textbox(/When did you receive the transfer request\?/)
  }
}
