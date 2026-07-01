# `Element.scrollParent()` polyfill

A lightweight JavaScript polyfill for `Element.scrollParent()`, modeled after the standard behavior of scroll container resolution in the CSSOM View and CSS Overflow specifications.

It utilizes `get-containing-block` to correctly resolve the scroll parent for absolutely and fixed-positioned elements, skipping static ancestor containers that do not clip them.

This project is fully tested using the official [Web Platform Tests (WPT)](https://github.com/web-platform-tests/wpt).

<!-- WPT_STATUS_START -->
- PASS: 17 / 17
- FAIL: 0 / 17
<!-- WPT_STATUS_END -->

## Features

- **Specification-Compliant Resolution**: Resolves standard scroll containers accurately by checking computed `overflow-x` and `overflow-y` styles (`auto`, `scroll`, `hidden`).
- **Absolute & Fixed Support**: Correctly skips non-containing blocks for absolute and fixed positioned elements to find their true scrolling ancestor.
- **CSS Overflow Propagation**: Accounts for UA-specific overflow propagation from the `<body>` and `<html>` elements to the viewport.
- **Prototype Polyfill**: Automatically polyfills `Element.prototype.scrollParent()`.
- **Flexible API**: Can be used as an imported standalone utility or called directly on DOM element prototypes.
- **Fully Typed**: Written in TypeScript with standard types exported.
- **ESM Support**: Built as an ES Module.
- **WPT Compliant**: Tested against the Web Platform Tests for scrollParent.

## Installation

```bash
npm install scrollparent-polyfill
```

## Usage

### 1. As a Polyfill

Simply import the package or load the IIFE bundle via CDN to automatically install the method on `Element.prototype`.

#### Via Bundler (ESM)

```javascript
import 'scrollparent-polyfill';

const element = document.querySelector('.my-child-element');

// Call standard camelCase method
const scrollParent = element.scrollParent();

console.log('Scroll parent is:', scrollParent);
```

#### Direct Browser Usage (IIFE via CDN)

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

### 2. As a Standalone Utility

If you prefer not to modify the global `Element.prototype`, you can import the helper function directly:

```javascript
import { getScrollParent } from 'scrollparent-polyfill';

const element = document.querySelector('.my-child-element');
const scrollParent = getScrollParent(element);

console.log('Scroll parent is:', scrollParent);
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

## Development

### Installation

To install dependencies for development:

```bash
npm install
```

### Building

To build the project (ESM, IIFE, and Types):

```bash
npm run build
```

### Testing

To run all tests (unit and Web Platform Tests):

```bash
npm run test
```

Or you can run them individually:

1. **Unit / Integration Tests**: Tests using Playwright.
   ```bash
   npm run test:unit
   ```

2. **Web Platform Tests (WPT)**: Runs the official WPT suite for `scrollParent`.
   ```bash
   # Run WPT tests (requires Python and Firefox)
   npm run test:wpt

   # Run WPT tests locally for debugging
   npm run test:wpt:local
   ```

## License

MIT

## Disclaimer

This project is AI-assisted using [Google Antigravity](https://antigravity.google/), based on the spec and WPT.