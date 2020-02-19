import {focusIn, focusIfExists} from 'utils/focus';

export function blurTo(selector) {
  return {
    keys: ['left', 'h', 'escape'],
    action: ({target}) => {
      selector
        ? focusIfExists(target.closest(selector))
        : target.blur();
    }
  };
}

export function focusTo(selector) {
  return {
    keys: ['right', 'l', 'enter'],
    action: ({target}) => focusIn(target, selector)
  };
}

export function navigateAmongSiblings(selector) {
  return [
    {keys: ['down', 'j'], action: e => focusNextSibling(selector)},
    {keys: ['up', 'k'], action: e => focusPrevSibling(selector)}
  ];
}

function focusNextSibling(selector) {
  const focused = document.activeElement;
  if (focused === document.body) {
    focusIfExists(document.querySelector(selector));
    return;
  }
  const next = focused.nextElementSibling;
  if (next && next.matches(selector)) next.focus();
}

function focusPrevSibling(selector) {
  const focused = document.activeElement;
  const prev = focused.previousElementSibling;
  if (prev && prev.matches(selector)) prev.focus();
}

export function moveUp(callback) {
  return {
    keys: ['shift+up', 'shift+k'],
    action: e => { callback(); ensureIsVisible(e.target); }
  };
}

export function moveDown(callback) {
  return {
    keys: ['shift+down', 'shift+j'],
    action: e => { callback(); ensureIsVisible(e.target); }
  };
}

function ensureIsVisible(element) {
  const supportsNativeSmoothScroll = 'scrollBehavior' in document.documentElement.style;

  setTimeout(() => {
    if (isElementInViewport(element)) return;
    if (supportsNativeSmoothScroll) {
      element.scrollIntoView({behavior: 'smooth'});
    } else {
      element.scrollIntoView();
    }
  }, 50);
}

function isElementInViewport (element) {
  var rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= window.innerHeight &&
    rect.right <= window.innerWidth
  );
}

export function clickInParent(parentSelector, selector) {
  return event => clickIn(event.target.closest(parentSelector), selector);
}

function clickIn(container, selector) {
  const el = container.querySelector(selector)
  el && el.click();
}
