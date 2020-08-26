export function selectElement(el) {
  const selection = window.getSelection();
  if (!selection) return; //Should not happen, but typescript indicates it's possible
  const range = document.createRange();

  range.selectNodeContents(el);
  selection.removeAllRanges();
  selection.addRange(range);
}
