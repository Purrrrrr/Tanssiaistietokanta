import {focusIn, focusIfExists} from 'utils/focus';
import {ensureIsVisible} from 'utils/ensureIsVisible';
import {swallowNextKeyup} from 'utils/swallowNextKeyup';

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
    action: (event) => {
      //Prevent unwanted keyup actions in the newly focused element
      swallowNextKeyup(event);
      focusIn(event.target, selector);
    }
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
  const next = focused?.nextElementSibling;
  if (next && next instanceof HTMLElement && next.matches(selector)) next.focus();
}

function focusPrevSibling(selector) {
  const focused = document.activeElement;
  const prev = focused?.previousElementSibling;
  if (prev && prev instanceof HTMLElement && prev.matches(selector)) prev.focus();
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

export function clickInParent(parentSelector, selector) {
  return event => clickIn(event.target.closest(parentSelector), selector);
}

function clickIn(container, selector) {
  const el = container.querySelector(selector)
  el && el.click();
}
