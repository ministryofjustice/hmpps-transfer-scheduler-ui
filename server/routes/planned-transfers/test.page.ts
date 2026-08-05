import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BrowsePlannedTransfersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/planned-transfers/,
      title: '11 results found: Search for a planned transfer - Manage planned transfers - DPS',
      caption: 'Manage planned transfers',
      heading: /Search for a planned transfer/,
    })
  }

  searchField() {
    return this.textbox('Enter a prisoner name or number. A maximum of 10 results can be returned.')
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
