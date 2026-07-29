import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class MoveTransferToPlanningConfirmationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/move-to-planning\/confirmation/,
      title: 'Transfer moved to planned transfers - DPS',
      heading: 'Transfer moved for Prisoner-Name Prisoner-Surname',
    })
  }
}
