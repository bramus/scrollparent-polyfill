import { getContainingBlock } from 'get-containing-block';

function hasNoAssociatedBox(element: Element): boolean {
  if (!element.isConnected) {
    return true;
  }
  let current: Element | null = element;
  while (current) {
    const style = getComputedStyle(current);
    if (style.display === 'none') {
      return true;
    }
    if (current === element && style.display === 'contents') {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isScrollContainer(element: Element): boolean {
  const style = getComputedStyle(element);
  const overflowX = style.overflowX;
  const overflowY = style.overflowY;

  const hasScrollableOverflow =
    overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden' ||
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden';

  if (!hasScrollableOverflow) {
    return false;
  }

  // Check if overflow is propagated to the viewport.
  if (element === document.documentElement) {
    return false;
  }

  if (document.body && element === document.body) {
    const rootStyle = getComputedStyle(document.documentElement);
    const rootOverflowX = rootStyle.overflowX;
    const rootOverflowY = rootStyle.overflowY;
    const isRootVisible =
      (rootOverflowX === 'visible' || rootOverflowX === 'clip') &&
      (rootOverflowY === 'visible' || rootOverflowY === 'clip');
    if (isRootVisible) {
      return false;
    }
  }

  return true;
}

/**
 * Finds the scroll parent of a given Element.
 * @param node The element to find the scroll parent for.
 */
export function getScrollParent(node: Element): Element | null | undefined {
  if (!node) {
    return undefined;
  }

  // 1. If element does not have an associated box, return null.
  if (hasNoAssociatedBox(node)) {
    return null;
  }

  // 2. If element is the HTML body element, return the document's scrolling element.
  if (document.body && node === document.body) {
    return document.scrollingElement || null;
  }

  // 3. If element is the document's scrolling element or the document's root element, return null.
  if (node === document.scrollingElement || (document.documentElement && node === document.documentElement)) {
    return null;
  }

  // 4. Let container be the containing block of element.
  let current: Element | null = node;
  const res = getContainingBlock(current as HTMLElement);
  let container: Element | null = res.container;

  // 5. While container is not null:
  while (container) {
    // a. If container is a scroll container, return container.
    if (isScrollContainer(container)) {
      return container;
    }
    // b. If container is the HTML body element, return the document's scrolling element.
    if (document.body && container === document.body) {
      return document.scrollingElement || null;
    }
    // c. If container is the document's root element, return null.
    if (document.documentElement && container === document.documentElement) {
      return null;
    }
    // d. Set container to the containing block of container.
    const nextRes = getContainingBlock(container as HTMLElement);
    container = nextRes.container;
  }

  // 6. Return null.
  return null;
}

// Expose the polyfill on the Element prototype if we are in a browser environment.
if (typeof Element !== 'undefined') {
  if (!('scrollParent' in Element.prototype)) {
    Object.defineProperty(Element.prototype, 'scrollParent', {
      value: function(this: Element) {
        return getScrollParent(this);
      },
      writable: true,
      configurable: true
    });
  }
}

// Declare the module augmentations so users of TypeScript will have correct typings.
declare global {
  interface Element {
    scrollParent(): Element | null | undefined;
  }
}
