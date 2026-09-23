import { handleCallback } from "@vercel/queue";
import { handlers } from "../handlers/index.js";
import type { BaskEvent, Handler } from "../handlers/types.js";

/**
 * Consumer for the `bask-events` topic (wired in `vercel.json`).
 *
 * Vercel invokes it once per message. It looks up `handlers[type]` from
 * `handlers/index.ts` and runs it. No business logic lives here: add a file
 * under `handlers/` and register it instead.
 *
 * Returning acknowledges the message. A thrown error redelivers it with
 * backoff. Unknown event types are logged and acknowledged so a new Bask
 * event never blocks the queue.
 */
const consume = handleCallback<BaskEvent>(async ({ type, data }, metadata) => {
  // ponytail: string index into a literal-keyed map; `any` here is the untyped wire payload
  const handler = (handlers as Record<string, Handler<any>>)[type];
  if (!handler) {
    console.log("unhandled event", type, metadata.messageId);
    return;
  }
  await handler(data, { ...metadata, type });
});

/**
 * Queue triggers call the Web Standard `fetch` export. A named `POST` export
 * never fires here. Anyone hitting `/api/queues` over HTTP gets `404`.
 */
export default { fetch: consume };
