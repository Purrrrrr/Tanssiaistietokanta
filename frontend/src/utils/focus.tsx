export function focusLater(selector, base = document) {
  setTimeout(() => {
    const el = selector instanceof Element ? selector
     : base.querySelector(selector);
    focusIfExists(el);
  }, 10);
}

export function focusSiblingsOrParent(element, parentSelector) {
    const {previousElementSibling, nextElementSibling} = element;
    focusIfExists(
      nextElementSibling ??
      previousElementSibling ??
      element.closest(parentSelector)
    );
}

export function focusIn(container, selector) {
  focusIfExists(container.querySelector(selector));
}

export function focusIfExists(element) {
  if (element) element.focus();
}
