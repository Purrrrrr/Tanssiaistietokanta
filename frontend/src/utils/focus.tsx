export function focusLater(selector, base ?: HTMLElement | Document | null) {
  setTimeout(() => {
    const el = selector instanceof Element ? selector
     : (base ?? document).querySelector(selector);
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
