import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class EditTransferPriorityPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/priority/,
      title: /What is the priority of this transfer - Manage (scheduled|planned) transfers - DPS/,
      caption: /Manage (scheduled|planned) transfers/,
      heading: 'What is the priority of this transfer?',
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  priorityHighRadio() {
    return this.radio('High')
  }

  priorityLowRadio() {
    return this.radio('Low')
  }
}
