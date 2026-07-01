/**
 * GaslessToggle component tests (SSR render — no browser required).
 * Run: pnpm test:gasless
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { GaslessToggle } from "../src/components/GaslessToggle.js";
import { GaslessEnableButton } from "../src/components/GaslessEnableButton.js";

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

  it("includes disabled title on gasless segment when gaslessDisabled", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessToggle, {
        gasless: false,
        gaslessDisabled: true,
        gaslessDisabledReason: "Wallet not supported",
        onChange: () => {},
      }),
    );
    assert.match(html, /Wallet not supported/);
    assert.match(html, /disabled/);
  });
});

describe("GaslessEnableButton", () => {
  it("renders enable CTA when gasless is off", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessEnableButton, {
        gasless: false,
        onEnable: () => {},
        onDisable: () => {},
      }),
    );
    assert.match(html, /Enable gasless deposits/);
  });

  it("renders enabled state with use standard action", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessEnableButton, {
        gasless: true,
        onEnable: () => {},
        onDisable: () => {},
      }),
    );
    assert.match(html, /Gasless enabled/);
    assert.match(html, /Use standard/);
  });

  it("renders switch to Epoch smart account when setup needed", () => {
    const html = renderToStaticMarkup(
      createElement(GaslessEnableButton, {
        gasless: false,
        needsEpochSetup: true,
        onEnable: () => {},
        onDisable: () => {},
        onSwitchSmartAccount: () => {},
      }),
    );
    assert.match(html, /Switch to Epoch smart account/);
  });
});
