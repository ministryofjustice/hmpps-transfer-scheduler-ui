import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferDetailsPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/plan-details/,
      title: 'Add transfer details - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: /Enter the details for (.+?)/,
    })
  }

  requestDateField() {
    return this.textbox(/When did you receive the transfer request\?/)
  }

  priorityRadio() {
    return this.radio('High')
  }

  priorityLowRadio() {
    return this.radio('Low')
  }

  dateField() {
    return this.textbox(/What date will (.+?)’s transfer be\? \(optional\)/)
  }

  hourField() {
    return this.textbox('Hour')
  }

  minuteField() {
    return this.textbox('Minute')
  }

  destinationInput() {
    return this.dropdown('Enter the prison this prisoner is being transferred to (optional)')
  }

  reasonInput() {
    return this.dropdown('Enter a reason for this transfer')
  }

  logisticsInput() {
    return this.dropdown('Which escort type is being used for this transfer? (optional)')
  }

  commentsField() {
    return this.textbox('Add any comments for this transfer (optional)')
  }
}
