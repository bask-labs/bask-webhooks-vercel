import type { Handler } from "./types.js";

/** Fields of `newOrder` this handler reads. */
type NewOrder = { orderId: string; patientId: number };

/**
 * Fires when a patient submits a checkout or a refill order is placed.
 * Replace the log with an upsert keyed on `orderId`.
 *
 * @see https://docs.bask.health/platform/webhooks/orders/created
 */
const newOrder: Handler<NewOrder> = async (data) => {
  console.log("new order", data.orderId, "patient", data.patientId);
};

export default newOrder;
