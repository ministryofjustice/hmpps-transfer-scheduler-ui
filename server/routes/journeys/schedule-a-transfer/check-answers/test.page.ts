import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/schedule-a-transfer\/check-answers/,
      title: 'Check your answers - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Check your answers',
    })
  }
}
