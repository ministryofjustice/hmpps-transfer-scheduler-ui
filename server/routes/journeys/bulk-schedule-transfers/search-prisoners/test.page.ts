import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkScheduleTransferSearchPrisonerPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-schedule-transfers\/search-prisoner/,
      title: 'Search for a prisoner - Schedule transfers in bulk - DPS',
      caption: 'Schedule transfers in bulk',
      heading: 'Search for a prisoner',
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
  }
}
