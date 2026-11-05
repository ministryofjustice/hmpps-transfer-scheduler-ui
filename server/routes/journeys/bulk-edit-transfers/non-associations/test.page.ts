import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransfersNonAssociationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/non-associations/,
      title: 'Some prisoners have a non-association - Edit scheduled transfers in bulk - DPS',
      heading: 'Some prisoners have a non-association',
    })
  }
}
