import type { Handler } from "./types";

/** Fields of `orderUpdated` this handler reads. */
type OrderUpdated = { orderId: string; eventCode: string; trackingNumber?: string };

/**
 * Fires on every order change. Branch on `eventCode`, not on arrival order.
 *
 * @see https://docs.bask.health/platform/webhooks/orders/updated
 */
const orderUpdated: Handler<OrderUpdated> = async (data) => {
  if (data.eventCode === "tracking_updated") {
    console.log("tracking updated", data.orderId, data.trackingNumber);
  }
};

export default orderUpdated;
