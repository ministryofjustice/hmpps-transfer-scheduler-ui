import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferNonAssociationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/non-associations/,
      title: 'This prisoner has a non-association - Plan a transfer - DPS',
      heading: 'This prisoner has a non-association',
    })
  }
}
