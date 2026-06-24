import { BaseTestPage } from '../../integration_tests/pages/baseTestPage'

export class Homepage extends BaseTestPage {
  async verifyContent() {
    return this.verify({
      pageUrl: /localhost:3007\/?$/,
      title: 'Schedule a transfer for a prisoner - DPS',
      heading: 'Schedule a transfer for a prisoner',
    })
  }
}
