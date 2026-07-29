import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class MoveTransferToPlanningPriorityPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/move-to-planning\/priority/,
      title: 'What is the priority of this transfer - Manage transfers - DPS',
      caption: 'Manage transfers',
      heading: 'What is the priority of this transfer?',
      backUrl: /request-date/,
    })
  }

  priorityRadio() {
    return this.radio('High')
  }
}
