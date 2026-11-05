import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class BulkEditTransferSearchPrisonerPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/bulk-edit-transfers\/search-prisoner/,
      title: 'Search for a prisoner - Edit scheduled transfers in bulk - DPS',
      caption: 'Edit scheduled transfers in bulk',
      heading: 'Search for a prisoner',
    })
  }

  searchField() {
    return this.textbox('Search for a prisoner')
  }
}
