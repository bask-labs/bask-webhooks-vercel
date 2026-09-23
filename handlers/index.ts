import type { Handler } from "./types.js";
import newOrder from "./new-order.js";
import orderUpdated from "./order-updated.js";

/**
 * Event name to handler. This is the only file to touch when you add an event.
 *
 * 1. Create `handlers/<event>.ts` exporting a {@link Handler}.
 * 2. Import it and add one line here. The key is the Bask `type` value.
 *
 * Events with no entry are logged as unhandled and acknowledged.
 *
 * @see https://docs.bask.health/platform/webhooks for every event name
 */
export const handlers = {
  newOrder,
  orderUpdated,
} satisfies Record<string, Handler<any>>;
