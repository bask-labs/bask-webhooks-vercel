import type { MessageMetadata } from "@vercel/queue";

/**
 * Shape of every Bask webhook body.
 *
 * `type` is the event name (`newOrder`, `orderUpdated`, `newPatient`, ...).
 * `data` differs per event; every `*Updated` event carries an `eventCode` that
 * names the change.
 *
 * @see https://docs.bask.health/platform/webhooks
 */
export type BaskEvent = { type: string; data: Record<string, unknown> };

/** Queue metadata plus the Bask event name that selected this handler. */
export type HandlerContext = MessageMetadata & { type: string };

/**
 * One function per Bask event type. Register it in `handlers/index.ts`.
 *
 * Contract:
 * - Upsert on `orderId`, `treatmentId`, `subscriptionId`, or `patientId` plus
 *   `type` and `eventCode`. Bask and Vercel Queues both deliver at-least-once,
 *   so `ctx.deliveryCount` can be greater than 1.
 * - Do not assume order. An `orderUpdated` can arrive before its `newOrder`.
 * - Do not deduplicate in memory. Fluid Compute reuses and recycles instances.
 * - Return normally to acknowledge. Throw only for retryable failures; the
 *   queue redelivers with backoff until the message expires after 24 hours.
 *
 * @typeParam TData - The `data` fields this handler reads. Keep it to what you
 *   touch; Bask adds fields without notice.
 */
export type Handler<TData = Record<string, unknown>> = (
  data: TData,
  ctx: HandlerContext,
) => void | Promise<void>;
