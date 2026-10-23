export const initHmppsSortSelector = () => {
  const $buttons = Array.from(document.querySelectorAll('.hmpps-sort-selector__sort-button'))
  if ($buttons.length) {
    $buttons.forEach($button => $button.classList.add('govuk-!-display-none'))
    Array.from(document.getElementsByClassName('hmpps-sort-selector__select')).forEach(s => {
      s.addEventListener('change', () => {
        s.form.submit()
      })
    })
  }
}
