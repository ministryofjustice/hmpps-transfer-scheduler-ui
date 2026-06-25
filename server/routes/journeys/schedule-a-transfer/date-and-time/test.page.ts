import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferDateTimePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/date-and-time/,
      title: 'Enter the transfer date and time - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Enter the transfer date and time',
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
