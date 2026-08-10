import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferDateTimePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/date-and-time/,
      title: 'Enter the transfer date and time - Manage scheduled transfers - DPS',
      caption: 'Manage scheduled transfers',
      heading: 'Enter the transfer date and time',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  dateField() {
    return this.textbox(/What date will (.+?)’s transfer be\?/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }
}
