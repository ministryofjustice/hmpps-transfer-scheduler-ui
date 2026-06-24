import { BaseTestPage } from '../../../../integration_tests/pages/baseTestPage'

export class ScheduleTransferSearchPrisonerPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/search-prisoner\/schedule-a-transfer/,
      title: 'Search for a prisoner - Schedule a transfer - DPS',
      caption: 'Schedule a transfer',
      heading: 'Search for a prisoner',
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
  }
}
