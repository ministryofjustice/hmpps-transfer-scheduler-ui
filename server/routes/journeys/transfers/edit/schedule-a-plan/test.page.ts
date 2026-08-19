import { BaseTestPage } from '../../../../../../integration_tests/pages/baseTestPage'

export class SchedulePlanPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/transfers\/edit\/schedule-a-plan/,
      title: 'Are you sure you want to schedule this plan - Manage planned transfers - DPS',
      caption: 'Manage planned transfers',
      heading: /Are you sure you want to schedule this plan\?/,
      backUrl: /\/transfers\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/,
    })
  }

  yesRadio() {
    return this.radio('Yes')
  }

  noRadio() {
    return this.radio('No')
  }
}
