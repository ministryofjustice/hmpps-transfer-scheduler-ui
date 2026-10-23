import {
  Alert,
  AlertFlagLabel,
  AlertsServiceAlert,
  getAlertFlagLabelsForAlerts,
} from '@ministryofjustice/hmpps-connect-dps-shared-items'

function isAlertsServiceAlert(alert: Alert): alert is AlertsServiceAlert {
  return typeof alert.alertCode !== 'string'
}

export const getAlertFlags = (alerts: Alert[]) => {
  const alertFlags: AlertFlagLabel[] = []

  const activeAlertCodes = alerts
    .map(alert => {
      const alertsServiceAlert = isAlertsServiceAlert(alert)
      const alertIsActive = alertsServiceAlert ? alert.isActive : alert.active && !alert.expired
      const prisonerAlertCode = alertsServiceAlert ? alert.alertCode.code : alert.alertCode

      return alertIsActive ? prisonerAlertCode : null
    })
    .filter(Boolean)

  if (activeAlertCodes.find(code => code === 'TAP')) {
    alertFlags.push({
      alertCodes: ['TAP'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Accredited Programme hold',
    })
  }
  if (activeAlertCodes.find(code => code === 'TAH')) {
    alertFlags.push({
      alertCodes: ['TAH'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Allocation Hold',
    })
  }
  if (activeAlertCodes.find(code => code === 'TG')) {
    alertFlags.push({
      alertCodes: ['TG'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Governor’s Hold',
    })
  }
  if (activeAlertCodes.find(code => code === 'TM')) {
    alertFlags.push({
      alertCodes: ['TM'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Medical Hold',
    })
  }
  if (activeAlertCodes.find(code => code === 'TCPA')) {
    alertFlags.push({
      alertCodes: ['TCPA'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Transfer Restriction',
    })
  }
  if (activeAlertCodes.find(code => code === 'TPR')) {
    alertFlags.push({
      alertCodes: ['TPR'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Parole Review Hold',
    })
  }
  if (activeAlertCodes.find(code => code === 'TSE')) {
    alertFlags.push({
      alertCodes: ['TSE'],
      classes: 'dps-alert-status dps-alert-status--risk',
      label: 'Security Hold',
    })
  }

  alertFlags.push(...getAlertFlagLabelsForAlerts(alerts))
  return alertFlags
}
