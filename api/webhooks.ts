import { send } from "@vercel/queue";

// Receiver: check the shared secret, publish the event, return fast.
// Keep business logic out of here. Bask waits 60s and counts slow replies as failures.
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
