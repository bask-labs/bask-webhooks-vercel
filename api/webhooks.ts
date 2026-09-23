import { send } from "@vercel/queue";

/**
 * Receives one Bask webhook delivery at `POST /api/webhooks`.
 *
 * Does three things and nothing else: compares the `Authorization` header to
 * `BASK_WEBHOOK_SECRET`, rejects bodies with no `type`, and publishes the body
 * to the `bask-events` topic that `api/queues.ts` consumes. Rename the topic
 * there and in `vercel.json` together. Business logic belongs in `api/queues.ts`.
 *
 * Bask waits 60 seconds for a response and counts a slow or non-2xx reply as a
 * failed delivery. Failures feed the auto-disable rule (50% failed over 24 hours),
 * so keep this function under 1 second of work.
 *
 * @param request - The raw delivery. Body is `{ type: string, data: object }`.
 * @returns
 * - `200 { received: true, messageId }` once the queue stored the event.
 *   `messageId` is `null` for about a minute after a fresh deploy while the
 *   queue discovers the consumer. The event still arrives.
 * - `401` when the header is missing or wrong. Bask retries; fix the header in
 *   **Settings → Webhooks & APIs**.
 * - `400` when `type` is missing.
 * - `500` (thrown) when `send` fails. Nothing was stored, so a Bask retry is safe.
 *
 * @see https://docs.bask.health/platform/webhooks/reliability
 */
export async function POST(request: Request) {
  const expected = `Bearer ${process.env.BASK_WEBHOOK_SECRET}`;
  if (request.headers.get("authorization") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  const event = await request.json();
  if (!event?.type) {
    return new Response("Missing event type", { status: 400 });
  }

  const { messageId } = await send("bask-events", event);
  return Response.json({ received: true, messageId });
}
