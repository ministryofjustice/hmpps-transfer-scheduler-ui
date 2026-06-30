import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/confirmation/,
      title: 'Transfer scheduled - DPS',
      heading: 'Prisoner-Name Prisoner-Surname has been scheduled for a transfer',
    })
  }
}
