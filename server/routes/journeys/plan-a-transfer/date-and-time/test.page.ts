import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferDateTimePage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/date-and-time/,
      title: 'Enter the transfer date and time (optional) - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: 'Enter the transfer date and time (optional)',
      backUrl: /priority/,
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
