export function selectElement(el) {
  const range = document.createRange();
  const selection = window.getSelection();

  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}
