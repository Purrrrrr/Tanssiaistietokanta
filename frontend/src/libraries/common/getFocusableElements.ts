export function getFocusableElements(container: HTMLElement) {
  return [
    ...container.querySelectorAll(focusableSelector) as NodeListOf<HTMLElement>,
  ].filter(el => !el.getAttribute('aria-hidden') && el.style.display !== 'none')
}

const focusableSelector = 'a[href], area[href], input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), details, iframe, object, embed, [contenteditable], [tabindex]:not([tabindex="-1"])'
