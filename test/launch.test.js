import test from 'node:test';
import assert from 'node:assert/strict';
import {runtimeConfig} from '../lib/config.js';
import {formProof,validFormProof} from '../lib/core.js';
import {checkoutOptions} from '../lib/checkout.js';
const base={DATABASE_URL:'postgres://test',COOKIE_SECRET:'x'.repeat(32),STRIPE_SECRET_KEY:'sk_test_example',STRIPE_WEBHOOK_SECRET:'whsec_example',PAYMENTS_ENABLED:'true',APP_ORIGIN:'https://onedollarsurvey.com'};
test('sandbox checkout refuses live credentials',()=>{assert.equal(runtimeConfig(base).paymentsEnabled,true);assert.equal(runtimeConfig({...base,STRIPE_SECRET_KEY:'sk_live_example'}).paymentsEnabled,false)});
test('live mode never falls back to test data or opens before support/account verification',()=>{
 const live={...base,PAYMENT_MODE:'live',STRIPE_LIVE_SECRET_KEY:'sk_live_example',LIVE_STRIPE_WEBHOOK_SECRET:'whsec_live'};
 assert.equal(runtimeConfig(live).databaseUrl,undefined);
 assert.equal(runtimeConfig(live).paymentsEnabled,false);
 const ready={...live,LIVE_DATABASE_URL:'postgres://live',SUPPORT_EMAIL:'help@onedollarsurvey.com',SUPPORT_EMAIL_VERIFIED:'true',LIVE_STRIPE_ACCOUNT_CONFIRMED:'true',LIVE_TAX_READY:'true',LIVE_STRIPE_ACCOUNT_ID:'acct_survey',LIVE_STRIPE_PRICE_ID:'price_survey'};
 assert.equal(runtimeConfig(ready).paymentsEnabled,true);
 for(const key of ['LIVE_DATABASE_URL','SUPPORT_EMAIL_VERIFIED','LIVE_STRIPE_ACCOUNT_CONFIRMED','LIVE_TAX_READY','LIVE_STRIPE_ACCOUNT_ID','LIVE_STRIPE_PRICE_ID'])assert.equal(runtimeConfig({...ready,[key]:undefined}).paymentsEnabled,false);
 assert.equal(runtimeConfig({...ready,STRIPE_LIVE_SECRET_KEY:'sk_test_example'}).paymentsEnabled,false);
});
test('form proof rejects other browsers, altered signatures, early and expired submissions',()=>{
 const time=1794255000000,proof=formProof('browser-a','secret',time);
 assert.equal(validFormProof(proof,'browser-a','secret',time+1000),true);
 assert.equal(validFormProof(proof,'browser-b','secret',time+1000),false);
 assert.equal(validFormProof(proof+'x','browser-a','secret',time+1000),false);
 assert.equal(validFormProof(proof,'browser-a','secret',time+100),false);
 assert.equal(validFormProof(proof,'browser-a','secret',time+16*60000),false);
});
test('checkout scope remains one dollar, one time, separate session branding',()=>{
 const s=checkoutOptions('https://onedollarsurvey.com','browser-token',true);
 assert.equal(s.mode,'payment');assert.equal(s.line_items[0].price_data.unit_amount,100);assert.equal(s.line_items[0].price_data.currency,'usd');assert.equal(s.branding_settings.display_name,'One Dollar Survey');assert.equal(s.client_reference_id,'browser-token');assert.equal(s.payment_intent_data.metadata.project,'one-dollar-survey');assert.match(s.custom_text.submit.message,/Sandbox/);assert.equal(s.subscription_data,undefined);
});

test('live checkout uses its reusable inclusive price and Stripe Tax',()=>{const s=checkoutOptions('https://onedollarsurvey.com','browser',false,'price_live',true);assert.deepEqual(s.line_items,[{price:'price_live',quantity:1}]);assert.equal(s.automatic_tax.enabled,true);assert.equal(checkoutOptions('https://onedollarsurvey.com','browser',true).automatic_tax.enabled,false)});

test('manual tax handling never invokes Stripe Tax',()=>{assert.equal(checkoutOptions('https://onedollarsurvey.com','browser',false,'price_live',false).automatic_tax.enabled,false);assert.equal(runtimeConfig({...base,STRIPE_TAX_ENABLED:'false'}).taxEnabled,false)});
