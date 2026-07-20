import { BaseTestPage } from '../../../../../integration_tests/pages/baseTestPage'

export class PlanTransferDestinationPage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /\/plan-a-transfer\/destination/,
      title: 'Enter a destination for this prisoner (optional) - Plan a transfer - DPS',
      caption: 'Plan a transfer',
      heading: /Enter a destination for (.+?) \(optional\)/,
      backUrl: /date-and-time/,
    })
  }

  destinationInput() {
    return this.dropdown(/Enter a destination for (.+?) \(optional\)/)
  }
}
