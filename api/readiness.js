import Stripe from 'stripe';
import {timingSafeEqual} from 'node:crypto';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 const expected=process.env.SETUP_CHECK_TOKEN;
 const actual=req.headers.authorization?.replace(/^Bearer /,'');
 if(!expected||!actual||Buffer.byteLength(expected)!==Buffer.byteLength(actual)||!timingSafeEqual(Buffer.from(expected),Buffer.from(actual)))return res.status(404).end();
 if(req.method!=='GET')return res.status(405).end();
 const key=process.env.STRIPE_LIVE_SECRET_KEY;
 if(!/^(sk|rk)_live_/.test(key||''))return res.json({ready:false,reason:'live_key_missing_or_wrong_mode'});
 try{
  const stripe=new Stripe(key);
  const account=await stripe.accounts.retrieve();
  const price=await stripe.prices.retrieve(process.env.LIVE_STRIPE_PRICE_ID);
  const hook=await stripe.webhookEndpoints.retrieve(process.env.LIVE_STRIPE_WEBHOOK_ID);
  const accountMatches=account.id===process.env.LIVE_STRIPE_ACCOUNT_ID;
  const priceMatches=price.active&&price.livemode&&price.type==='one_time'&&price.currency==='usd'&&price.unit_amount===100;
  const webhookMatches=hook.livemode&&hook.status==='enabled'&&hook.url===process.env.APP_ORIGIN+'/api/webhook'&&hook.enabled_events.includes('checkout.session.completed');
  return res.json({ready:!!(accountMatches&&account.charges_enabled&&priceMatches&&webhookMatches),accountMatches,chargesEnabled:account.charges_enabled,payoutsEnabled:account.payouts_enabled,priceMatches,webhookMatches,pendingRequirements:account.requirements?.currently_due?.length??0});
 }catch(error){return res.status(503).json({ready:false,reason:'stripe_check_failed',code:error.code||error.type||'unavailable'})}
}
