export function runtimeConfig(env=process.env) {
  const testMode=env.PAYMENT_MODE!=='live';
  const databaseUrl=testMode?env.DATABASE_URL:env.LIVE_DATABASE_URL;
  const configured=!!databaseUrl&&env.COOKIE_SECRET?.length>=32;
  const stripeKey=testMode?env.STRIPE_SECRET_KEY:env.STRIPE_LIVE_SECRET_KEY;
  const webhookSecret=testMode?env.STRIPE_WEBHOOK_SECRET:env.LIVE_STRIPE_WEBHOOK_SECRET;
  const priceId=testMode?env.STRIPE_TEST_PRICE_ID:env.LIVE_STRIPE_PRICE_ID;
  const keyMatchesMode=(testMode?/^(sk|rk)_test_/:/^(sk|rk)_live_/).test(stripeKey||'');
  const supportReady=env.SUPPORT_EMAIL_VERIFIED==='true'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SUPPORT_EMAIL||'');
  const launchReady=testMode||(supportReady&&env.LIVE_STRIPE_ACCOUNT_CONFIRMED==='true'&&env.LIVE_TAX_READY==='true'&&!!env.LIVE_STRIPE_ACCOUNT_ID&&!!priceId);
  const paymentsEnabled=!!(configured&&keyMatchesMode&&launchReady&&env.PAYMENTS_ENABLED==='true'&&webhookSecret&&env.APP_ORIGIN);
  return {taxEnabled:env.STRIPE_TAX_ENABLED==='true',testMode,databaseUrl,stripeKey,webhookSecret,priceId,expectedAccountId:env.LIVE_STRIPE_ACCOUNT_ID,configured,paymentsEnabled,supportEmail:supportReady?env.SUPPORT_EMAIL:null};
}
