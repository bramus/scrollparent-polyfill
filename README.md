# `Element.scrollParent()` polyfill

A lightweight JavaScript polyfill for `Element.scrollParent()`, modeled after the standard behavior of scroll container resolution in the CSSOM View and CSS Overflow specifications.

It utilizes `get-containing-block` to correctly resolve the scroll parent for absolutely and fixed-positioned elements, skipping static ancestor containers that do not clip them.

## Features

- **Specification-Compliant Resolution**: Resolves standard scroll containers accurately by checking computed `overflow-x` and `overflow-y` styles (`auto`, `scroll`, `hidden`).
- **Absolute & Fixed Support**: Correctly skips non-containing blocks for absolute and fixed positioned elements to find their true scrolling ancestor.
- **CSS Overflow Propagation**: Accounts for UA-specific overflow propagation from the `<body>` and `<html>` elements to the viewport.
- **Prototype Polyfill**: Automatically polyfills `Element.prototype.scrollParent()`.
- **Flexible API**: Can be used as an imported standalone utility or called directly on DOM element prototypes.
- **Fully Typed**: Written in TypeScript with standard types exported.
- **ESM Support**: Built as an ES Module.

## Installation

```bash
npm install scrollparent-polyfill
```

## Usage

### 1. As a Polyfill

Simply import the package to automatically install the method on `Element.prototype`:

```javascript
import 'scrollparent-polyfill';

const element = document.querySelector('.my-child-element');

// Call standard camelCase method
const scrollParent = element.scrollParent();

console.log('Scroll parent is:', scrollParent);
```

### 2. As a Standalone Utility

If you prefer not to modify the global `Element.prototype`, you can import the helper function directly:

```javascript
import { getScrollParent } from 'scrollparent-polyfill';

const element = document.querySelector('.my-child-element');
const scrollParent = getScrollParent(element);

console.log('Scroll parent is:', scrollParent);
```

### 3. Direct Browser Usage (IIFE)

For direct browser usage without a bundler, you can load the bundled IIFE version from a CDN (such as unpkg):

```html
<!-- Load the polyfill from a CDN -->
<script src="https://unpkg.com/scrollparent-polyfill/dist/scrollparent-polyfill.iife.js"></script>

<script>
  const element = document.querySelector('.my-child-element');
  
  // The polyfill automatically installs the method on Element.prototype
  const scrollParent = element.scrollParent();
  
  console.log('Scroll parent is:', scrollParent);
</script>
```

## API

### `getScrollParent(node)`

**Parameters:**
- `node` (`Element`): The element to find the scroll parent for.

**Returns:**
- `Element | null | undefined`:
  - The scroll parent element if found.
  - `document.scrollingElement` if no other scroll parent is found (or if overflow propagates to the viewport).
  - `undefined` if the element is invalid or not connected to the document.

## License

MIT
