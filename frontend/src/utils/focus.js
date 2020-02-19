export function focusLater(selector, base = document) {
  setTimeout(() => focusIfExists(base.querySelector(selector)), 10);
}

export function focusIn(container, selector) {
  focusIfExists(container.querySelector(selector));
}

export function focusIfExists(element) {
  if (element) element.focus();
}
