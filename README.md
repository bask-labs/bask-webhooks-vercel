# bask-webhooks-vercel

Catch [Bask](https://bask.health) webhooks on Vercel. Two functions: a receiver that checks your secret and drops each event on a Vercel Queue, and a consumer that does the work with retries that never touch Bask.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Bask-Labs/bask-webhooks-vercel&project-name=bask-webhooks&repository-name=bask-webhooks&env=BASK_WEBHOOK_SECRET&envDescription=Shared%20secret%20Bask%20sends%20as%20Authorization%3A%20Bearer%20%3Csecret%3E&envLink=https://docs.bask.health/platform/webhooks/vercel)

Full guide: [docs.bask.health/platform/webhooks/vercel](https://docs.bask.health/platform/webhooks/vercel)

## Deploy

**One click.** Hit the button above. Vercel copies this repo into your GitHub, asks for `BASK_WEBHOOK_SECRET` (generate one with `openssl rand -hex 32`), and deploys.

**Or from the terminal.**

```bash
gh repo create my-bask-webhooks --template Bask-Labs/bask-webhooks-vercel --clone
cd my-bask-webhooks
vercel env add BASK_WEBHOOK_SECRET production   # paste: openssl rand -hex 32
vercel deploy --prod
```

Your endpoint is the production URL plus `/api/webhooks`.

## Connect in Bask

In your Admin Portal, open **Settings → Webhooks & APIs** and click **Add Webhook**.

| Field | Value |
|---|---|
| **Type** | The event to receive, for example `newOrder`. One webhook per event type, all on the same URL. |
| **URL** | `https://<your-project>.vercel.app/api/webhooks` |
| **Method** | `POST` |
| **Headers** | `Authorization: Bearer <your secret>` |
| **Status** | Active |

Save, then **Send Test Request**. `vercel logs --prod` shows the receipt and the consumer's log line a moment later.

## Verify by hand

```bash
curl -s -X POST https://<your-project>.vercel.app/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $BASK_WEBHOOK_SECRET" \
  -d '{"type":"newOrder","data":{"orderId":"ord_123","patientId":789,"testMode":true}}'
# {"received":true,"messageId":"..."}
```

Drop the `Authorization` header and you get `401`.

## Make it yours

Everything you care about lives in [`api/queues.ts`](api/queues.ts). Add a `case` per event type and write to your database or CRM there.

- **Upsert, don't insert.** Bask and Vercel Queues both deliver at-least-once. Key on `orderId`, `treatmentId`, `subscriptionId`, or `patientId` with `type` and `eventCode`.
- **Don't assume order.** An `orderUpdated` can land before its `newOrder`. Route on `eventCode` and your own stored state.
- **Keep the receiver thin.** Auth plus `send`, nothing else. Slow receivers count as failed deliveries and trip Bask's auto-disable rule.

Event reference: [docs.bask.health/platform/webhooks](https://docs.bask.health/platform/webhooks)

## Local development

`send` needs the project's Vercel credentials.

```bash
vercel link
vercel env pull
vercel dev
```
