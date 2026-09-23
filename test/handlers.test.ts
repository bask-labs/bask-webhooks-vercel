import { test } from "node:test";
import assert from "node:assert/strict";
import { handlers } from "../handlers";

// Every `type` Bask sends. Source: https://docs.bask.health/platform/webhooks
const BASK_EVENTS = new Set([
  "newPatient", "abandonedSession", "magicLink",
  "newTreatment", "treatmentUpdated", "treatmentCanceled", "newPrescription",
  "newOrder", "orderUpdated", "orderShipped",
  "paymentCreated", "paymentSucceeded", "paymentFailed", "paymentCanceled", "paymentRefunded",
  "disputeCreated", "disputeUpdated",
  "subscriptionCreated", "subscriptionUpdated",
  "chatMessage",
]);

test("every registry key is a Bask event name", () => {
  for (const key of Object.keys(handlers)) {
    assert.ok(BASK_EVENTS.has(key), `"${key}" is not a Bask webhook type`);
  }
});

test("every registry value is a function", () => {
  for (const [key, fn] of Object.entries(handlers)) {
    assert.equal(typeof fn, "function", `handlers.${key}`);
  }
});
