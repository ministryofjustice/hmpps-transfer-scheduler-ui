import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkScheduleTransfersNonAssociationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-schedule-transfers\/non-associations/,
      title: 'Some prisoners have a non-association - Schedule transfers in bulk - DPS',
      heading: 'Some prisoners have a non-association',
    })
  }
}
