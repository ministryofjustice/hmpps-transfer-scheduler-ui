import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferDestinationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/destination/,
      title: 'Enter the prison this prisoner is being transferred to - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Enter the prison this prisoner is being transferred to',
      backUrl: /date-and-time/,
    })
  }

  destinationInput() {
    return this.dropdown('Enter the prison this prisoner is being transferred to')
  }
}
