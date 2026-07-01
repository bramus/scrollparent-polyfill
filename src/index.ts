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

function isClosedShadowHidden(a: Node, b: Node): boolean {
  const root = a.getRootNode();
  if (!(root instanceof ShadowRoot)) {
    return false;
  }

  // Check if root is a shadow-including inclusive ancestor of b.
  let current: Node | null = b;
  let isAncestor = false;
  while (current) {
    if (current === root) {
      isAncestor = true;
      break;
    }
    if (current instanceof ShadowRoot) {
      current = current.host;
    } else {
      current = current.parentNode;
    }
  }

  if (isAncestor) {
    return false;
  }

  if (root.mode === 'closed') {
    return true;
  }

  return isClosedShadowHidden(root.host, b);
}

/**
 * Finds the scroll parent of a given Element.
 * https://drafts.csswg.org/cssom-view/#dom-htmlelement-scrollparent
 * @param node The element to find the scroll parent for.
 */
export function getScrollParent(node: Element): Element | null | undefined {
  if (!node) {
    return undefined;
  }

  // 1. If any of the following holds true, return null and terminate this algorithm:
  //     - The element does not have an associated box.
  //     - The element is the root element.
  //     - The element is the body element.
  //     - The element’s computed value of the position property is fixed and no ancestor establishes a fixed position containing block.
  if (hasNoAssociatedBox(node)) {
    return null;
  }

  if (node === node.ownerDocument.documentElement) {
    return null;
  }

  if (node === node.ownerDocument.body) {
    return null;
  }

  const style = getComputedStyle(node);
  if (style.position === 'fixed') {
    const { container } = getContainingBlock(node as HTMLElement);
    if (!container) {
      return null;
    }
  }

  // 2. Let ancestor be the containing block of the element in the flat tree and repeat these substeps:
  let ancestor: Element | null = getContainingBlock(node as HTMLElement).container;

  while (true) {
    // 2.1. If ancestor is the initial containing block, return the scrollingElement for the element’s document if it is not closed-shadow-hidden from the element, otherwise return null.
    if (!ancestor) {
      const scrollingElement = node.ownerDocument?.scrollingElement || null;
      if (scrollingElement && !isClosedShadowHidden(scrollingElement, node)) {
        return scrollingElement;
      }
      return null;
    }

    // 2.2. If ancestor is not closed-shadow-hidden from the element, and is a scroll container, terminate this algorithm and return ancestor.
    if (!isClosedShadowHidden(ancestor, node) && isScrollContainer(ancestor)) {
      return ancestor;
    }

    // 2.3. If the computed value of the position property of ancestor is fixed, and no ancestor establishes a fixed position containing block, terminate this algorithm and return null.
    const ancestorStyle = getComputedStyle(ancestor);
    if (ancestorStyle.position === 'fixed') {
      const { container } = getContainingBlock(ancestor as HTMLElement);
      if (!container) {
        return null;
      }
    }

    // 2.4. Let ancestor be the containing block of ancestor in the flat tree.
    ancestor = getContainingBlock(ancestor as HTMLElement).container;
  }
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
