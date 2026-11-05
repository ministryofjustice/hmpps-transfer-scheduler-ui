import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransfersEditListPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/edit-list/,
      title: 'Edit list of scheduled transfers - Edit scheduled transfers in bulk - DPS',
      caption: 'Edit scheduled transfers in bulk',
      heading: 'Edit list of scheduled transfers',
      backUrl: /bulk-edit-transfers$/,
    })
  }

  dateField() {
    return this.textbox('Date')
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }

  destinationInput() {
    return this.dropdown('To prison destination')
  }

  reasonInput() {
    return this.dropdown('Reason')
  }

  logisticsInput() {
    return this.dropdown('Escort details')
  }

  commentsField() {
    return this.textbox('Comments')
  }
}
