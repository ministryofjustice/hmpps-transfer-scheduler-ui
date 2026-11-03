import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkScheduleTransferDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-schedule-transfers\/transfer-details/,
      title: 'Add transfer details - Schedule transfers in bulk - DPS',
      caption: 'Schedule transfers in bulk',
      heading: 'Add transfer details',
      backUrl: /search-prisoners/,
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

  destinationInput() {
    return this.dropdown('Enter the prison this prisoner is being transferred to')
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }

  logisticsInput() {
    return this.dropdown('Which escort type is being used for this transfer?')
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer (optional)')
  }
}
