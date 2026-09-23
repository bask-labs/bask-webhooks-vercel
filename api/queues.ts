import { handleCallback } from "@vercel/queue";

/**
 * Shape of every Bask webhook body.
 *
 * `type` is the event name (`newOrder`, `orderUpdated`, `newPatient`, ...).
 * `data` differs per event; every `*Updated` event carries an `eventCode` that
 * names the change. Narrow this type per `case` as you add handlers.
 *
 * @see https://docs.bask.health/platform/webhooks
 */
export type BaskEvent = { type: string; data: Record<string, unknown> };

/**
 * Processes one queued Bask event. This is the file you edit.
 *
 * Vercel invokes it once per message on the `bask-events` topic (wired in
 * `vercel.json`). Return normally to acknowledge. Throw to redeliver with
 * backoff until the message expires 24 hours after publish.
 *
 * Contract for handlers you add:
 * - Upsert on `data.orderId`, `treatmentId`, `subscriptionId`, or `patientId`
 *   plus `type` and `eventCode`. Bask and Vercel Queues both deliver
 *   at-least-once, so `metadata.deliveryCount` can be greater than 1.
 * - Do not assume order. An `orderUpdated` can arrive before its `newOrder`.
 * - Do not deduplicate in memory. Fluid Compute reuses and recycles instances.
 * - Throw only for retryable failures. For malformed events, log and return, or
 *   pass a `retry` handler to `handleCallback` that returns `{ acknowledge: true }`.
 *
 * @param event - Deserialized body Bask sent, unchanged from the receiver.
 * @param metadata - Queue metadata: `messageId`, `deliveryCount`, `createdAt`,
 *   `expiresAt`, `topicName`, `consumerGroup`, `region`.
 */
const consume = handleCallback<BaskEvent>(async ({ type, data }, metadata) => {
  switch (type) {
    case "newOrder":
      console.log("new order", data.orderId, "patient", data.patientId);
      break;

    case "orderUpdated":
      if (data.eventCode === "tracking_updated") {
        console.log("tracking updated", data.orderId, data.trackingNumber);
      }
      break;

    default:
      console.log("unhandled event", type, metadata.messageId);
  }
});

/**
 * Queue triggers call the Web Standard `fetch` export. A named `POST` export
 * never fires here. Anyone hitting `/api/queues` over HTTP gets `404`.
 */
export default { fetch: consume };
