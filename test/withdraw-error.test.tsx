import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { WithdrawFundsButton } from "../src/components/WithdrawDetailPanel";

test("withdraw footer exposes execution errors instead of appearing unresponsive", () => {
  const html = renderToStaticMarkup(createElement(WithdrawFundsButton, {
    onClick: () => undefined,
    error: "Transaction cancelled",
  }));
  assert.match(html, /role="alert"/);
  assert.match(html, /Transaction cancelled/);
});

test("withdraw footer has no alert when there is no execution error", () => {
  const html = renderToStaticMarkup(createElement(WithdrawFundsButton, {
    onClick: () => undefined,
  }));
  assert.doesNotMatch(html, /role="alert"/);
});
