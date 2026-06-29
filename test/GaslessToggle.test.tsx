/**
 * GaslessToggle component tests (SSR render — no browser required).
 * Run: pnpm test:gasless
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { GaslessToggle } from "../src/components/GaslessToggle.js";

describe("GaslessToggle", () => {
  it("renders Gasless and Standard segments", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessToggle, {
        gasless: false,
        onChange: () => {},
      }),
    );
    assert.match(html, /Gasless/);
    assert.match(html, /Standard/);
  });

  it("marks gasless segment selected when gasless=true", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessToggle, {
        gasless: true,
        onChange: () => {},
      }),
    );
    assert.match(html, /aria-selected="true"/);
  });

  it("includes disabled title when disabledReason set", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessToggle, {
        gasless: false,
        disabled: true,
        disabledReason: "Wallet not supported",
        onChange: () => {},
      }),
    );
    assert.match(html, /Wallet not supported/);
  });
});
