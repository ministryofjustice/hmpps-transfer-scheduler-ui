import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkScheduleTransfersCheckAnswersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-schedule-transfers\/check-answers/,
      title: 'Check your answers - Schedule transfers in bulk - DPS',
      caption: 'Schedule transfers in bulk',
      heading: 'Check your answers',
    })
  }
}
