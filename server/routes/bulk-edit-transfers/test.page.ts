import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BulkEditTransfersSearchTransfersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers/,
      title: 'Create list of scheduled transfers - Edit scheduled transfers in bulk - DPS',
      caption: 'Edit scheduled transfers in bulk',
      heading: 'Create list of scheduled transfers',
    })
  }

  startDateField() {
    return this.textbox('Date from')
  }

  endDateField() {
    return this.textbox('Date to')
  }

  destinationInput() {
    return this.dropdown('Prison destination')
  }

  reasonInput() {
    return this.dropdown('Reason')
  }

  logisticsInput() {
    return this.dropdown('Escort details')
  }
}
