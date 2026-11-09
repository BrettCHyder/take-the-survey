export function runtimeConfig(env=process.env) {
  const testMode=env.PAYMENT_MODE!=='live';
  const databaseUrl=testMode?env.DATABASE_URL:env.LIVE_DATABASE_URL;
  const configured=!!databaseUrl&&env.COOKIE_SECRET?.length>=32;
  const keyMatchesMode=(testMode?/^(sk|rk)_test_/:/^(sk|rk)_live_/).test(env.STRIPE_SECRET_KEY||'');
  const supportReady=env.SUPPORT_EMAIL_VERIFIED==='true'&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.SUPPORT_EMAIL||'');
  const launchReady=testMode||(supportReady&&env.LIVE_STRIPE_ACCOUNT_CONFIRMED==='true');
  const paymentsEnabled=!!(configured&&keyMatchesMode&&launchReady&&env.PAYMENTS_ENABLED==='true'&&env.STRIPE_WEBHOOK_SECRET&&env.APP_ORIGIN);
  return {testMode,databaseUrl,configured,paymentsEnabled,supportEmail:supportReady?env.SUPPORT_EMAIL:null};
}
