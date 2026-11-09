# Take the Survey

A standalone one-question survey. Separate repository, Vercel project, database, and Stripe webhook from Sunday Serve.

## Current state
The interface is ready to preview. Voting safely stays disabled until a dedicated PostgreSQL database and cookie secret are configured. Payments additionally require explicit enablement and Stripe credentials. No simulated votes or pretend payments are shown.

## Deploy
Import this repository into a NEW Vercel project named `take-the-survey`, framework preset Other, output directory `public`, no build command. Use Node 24. Create a dedicated PostgreSQL database (e.g. Neon), execute `schema.sql`, and add environment variables from `.env.example` in Vercel. Never commit actual credentials. APP_ORIGIN must equal the deployed HTTPS origin, without trailing slash.

Use a random COOKIE_SECRET of at least 32 characters. Set a Stripe TEST secret key, register `/api/webhook` for `checkout.session.completed`, set its signing secret, then set PAYMENTS_ENABLED=true. Test a successful payment, decline, cancel, duplicate webhook delivery, cooldown and concurrent submissions. Keep production and preview databases, Stripe endpoints and origins separate. Test-mode payments are for testing only; reset test results or use a clean production database before launch.

Before live payments: add support/refund contact information to the details dialog, review actual privacy practices, add provider-level request rate limits/bot protection to checkout and submissions, and configure clear Stripe branding/statement description. Switch to live credentials only after end-to-end testing. No live payments have been configured.

## Data
`totals` holds aggregate counts. `browser_limits` holds hashes of random signed cookie IDs and cooldown timestamps; no IP address is stored. Delete expired rows periodically with `DELETE FROM browser_limits WHERE blocked_until < now()`. `payments` holds Stripe Checkout IDs plus browser hashes for atomic, exactly-once Yes counting. Browser hashes in counted payment rows can be cleared after the cooldown if long-term unlinkability is desired. No names, email addresses or card details are copied from Stripe. Provider logs may contain operational information.

The cookie is Secure, HttpOnly, SameSite=Lax and lasts two hours. The server atomically reserves a browser for an hour on submission or checkout initiation. This intentionally simple anti-spam approach is bypassable by clearing cookies. Cancelled or failed checkout reserves the browser for the remainder of that hour; this avoids repeated payment attempts. A verified Stripe webhook counts paid $1 USD sessions associated with this project, not the redirect URL. Refunded/disputed payments currently remain historical Yes responses.

## Checks
`npm install`, `npm run check`, `npm test`. Payment/database integration needs actual test-service configuration; unit checks do not prove the complete payment flow.

## Payment mode
PAYMENT_MODE defaults to test. Only sk_test_ or rk_test_ credentials enable checkout in this mode, and the interface labels checkout and counts as test data. Real payments require a deliberate later PAYMENT_MODE=live configuration, a live key, a matching live webhook and clean production database.
