export const initPrintButton = () => {
  const printOptions = document.getElementById('print-options');
  if (printOptions) {
    printOptions.classList.remove('govuk-!-display-none')

    document.getElementById('print-options-button').onclick = e => {
      e.preventDefault()
      e.stopPropagation()
      print()
    }
  }
}
