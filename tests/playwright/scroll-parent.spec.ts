import { test, expect } from '@playwright/test';

const targets = [
  {
    name: 'ESM Module',
    scriptOptions: {
      type: 'module',
      url: '/dist/index.js'
    }
  },
  {
    name: 'IIFE Script',
    scriptOptions: {
      url: '/dist/scrollparent-polyfill.iife.js'
    }
  }
];

for (const target of targets) {
  test.describe(`getScrollParent Polyfill - ${target.name}`, () => {
    test.beforeEach(async ({ page }) => {
      page.on('console', msg => console.log(`BROWSER LOG: ${msg.text()}`));

      await page.goto('/tests/playwright/fixtures/verification.html');

      // Inject getScrollParent by referencing its served URL
      await page.addScriptTag(target.scriptOptions);
    });

    test('Direct prototype properties are defined on Element', async ({ page }) => {
      const prototypeDefined = await page.evaluate(() => {
        return {
          hasCapitalP: 'scrollParent' in Element.prototype,
          hasLowercaseP: 'scrollparent' in Element.prototype
        };
      });
      expect(prototypeDefined.hasCapitalP).toBe(true);
      expect(prototypeDefined.hasLowercaseP).toBe(false);
    });

    test('Scroll container with overflow: scroll', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-scroll')!;
        const expected = document.getElementById('container-scroll')!;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Scroll container with overflow: auto', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-auto')!;
        const expected = document.getElementById('container-auto')!;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Scroll container with overflow: hidden', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-hidden')!;
        const expected = document.getElementById('container-hidden')!;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Nested elements with overflow: visible fallback to document.scrollingElement', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-visible')!;
        const expected = document.scrollingElement;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Absolute target skips static parent, finds absolute scroll container', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-absolute')!;
        const expected = document.getElementById('container-absolute-scroll')!;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Fixed target finds scroll parent inside transformed parent', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-fixed')!;
        const expected = document.getElementById('container-fixed-scroll')!;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Fixed target falls back to scrollingElement outside transforms', async ({ page }) => {
      const result = await page.evaluate(() => {
        const target = document.getElementById('target-fixed-fallback')!;
        const expected = document.scrollingElement;
        const result = target.scrollParent();
        return {
          passed: result === expected
        };
      });
      expect(result.passed).toBe(true);
    });

    test('Body element/Viewport scroll parent resolution', async ({ page }) => {
      const result = await page.evaluate(() => {
        const body = document.body;
        const scrollingElement = document.scrollingElement;
        const result = body.scrollParent();
        return {
          passed: result === scrollingElement
        };
      });
      expect(result.passed).toBe(true);
    });
  });
}
