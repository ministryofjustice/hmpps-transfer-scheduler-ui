import { BaseTestPage } from '../../../integration_tests/pages/baseTestPage'

export class BrowseScheduledTransfersPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/scheduled-transfers/,
      title: '11 results found: Search for a prisoner - Manage scheduled transfers - DPS',
      caption: 'Manage scheduled transfers',
      heading: /Search for a prisoner/,
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
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
