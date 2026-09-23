import { handleCallback } from "@vercel/queue";

type BaskEvent = { type: string; data: Record<string, unknown> };

// Consumer: Vercel invokes this once per queued event and retries when it throws.
// Put your database or CRM writes here. Upsert on ids: delivery is at-least-once.
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

// Must be the `fetch` export; a named POST export never fires for queue triggers.
export default { fetch: consume };
