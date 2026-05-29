import { getContainingBlock } from 'get-containing-block';

/**
 * Finds the scroll parent of a given Element.
 * @param node The element to find the scroll parent for.
 */
export function getScrollParent(node: Element): Element | null | undefined {
  if (!node || !node.isConnected) {
    return undefined;
  }

  let current: HTMLElement | null = node as HTMLElement;
  while (current) {
    const res = getContainingBlock(current);
    const container = res.container;
    if (!container) {
      break;
    }
    current = container;

    const style = getComputedStyle(current);
    const overflowX = style.overflowX;
    const overflowY = style.overflowY;

    if (
      overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'hidden' ||
      overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'hidden'
    ) {
      // https://drafts.csswg.org/css-overflow-3/#overflow-propagation
      // The UA must apply the overflow from the root element to the viewport;
      // however, if the overflow is visible in both axis, then the overflow
      // of the first visible child body is applied instead.
      if (current === document.body) {
        const scrollingElement = document.scrollingElement;
        if (scrollingElement) {
          const scrollingStyle = getComputedStyle(scrollingElement);
          const isVisibleX = scrollingStyle.overflowX === 'visible';
          const isVisibleY = scrollingStyle.overflowY === 'visible';
          if (isVisibleX && isVisibleY) {
            return scrollingElement;
          }
        }
      }

      return current;
    }
  }

  return document.scrollingElement || null;
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
