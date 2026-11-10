import Stripe from 'stripe';
import {randomUUID} from 'node:crypto';
import {browser,formProof,validFormProof} from '../lib/core.js';
import {runtimeConfig} from '../lib/config.js';
import {checkoutOptions} from '../lib/checkout.js';
import {db} from '../lib/db.js';

export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).end()}
 const config=runtimeConfig();
 const {configured,testMode,paymentsEnabled,supportEmail}=config;
 if(!configured)return res.status(req.method==='GET'?200:503).json({configured:false,testMode,paymentsEnabled:false,error:'The survey is being set up. Voting opens soon.'});
 try{
  const sql=db();
  const token=browser(req,res);
  if(req.method==='GET'){
   const [totals]=await sql`SELECT yes::text,no::text FROM totals WHERE id=1`;
   const [limit]=await sql`SELECT blocked_until FROM browser_limits WHERE token=${token} AND blocked_until>now()`;
   return res.json({configured:true,paymentsEnabled,testMode,supportEmail,yes:Number(totals.yes),no:Number(totals.no),blockedUntil:limit?.blocked_until||null,formProof:formProof(token,process.env.COOKIE_SECRET)});
  }
  if(!process.env.APP_ORIGIN||req.headers.origin!==process.env.APP_ORIGIN)return res.status(403).json({error:'Please submit from the survey website.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return res.status(415).json({error:'Please use the survey form.'});
  if(req.body?.website||!validFormProof(req.body?.formProof,token,process.env.COOKIE_SECRET))return res.status(400).json({error:'Please refresh the survey, choose your answer, and try again.'});
  const answer=req.body?.answer;
  if(!['yes','no'].includes(answer))return res.status(400).json({error:'Choose Yes or No.'});
  if(answer==='yes'&&!paymentsEnabled)return res.status(503).json({error:'Payments are not open yet.'});
  // One atomic reservation across concurrent clicks and requests.
  const claim=await sql.begin(async tx=>{
   const [row]=await tx`INSERT INTO browser_limits(token,blocked_until) VALUES(${token},now()+interval '1 hour') ON CONFLICT(token) DO UPDATE SET blocked_until=EXCLUDED.blocked_until WHERE browser_limits.blocked_until<=now() RETURNING token`;
   if(row&&answer==='no')await tx`UPDATE totals SET no=no+1 WHERE id=1`;
   return row;
  });
  if(!claim){res.setHeader('Retry-After','3600');return res.status(429).json({error:'You have already submitted or started checkout. Please come back in an hour.'})}
  if(answer==='no')return res.json({submitted:true});
  try{
   const stripe=new Stripe(config.stripeKey,{apiVersion:'2026-09-30.endive'});
   if(!testMode){
    const account=await stripe.accounts.retrieve();
    if(account.id!==config.expectedAccountId||!account.charges_enabled)throw Error('Live account is not ready');
   }
   const session=await stripe.checkout.sessions.create(checkoutOptions(process.env.APP_ORIGIN,token,testMode,config.priceId,config.taxEnabled),{idempotencyKey:randomUUID()});
   if(session.livemode===testMode)throw Error('Payment mode mismatch');
   await sql`INSERT INTO payments(session_id,browser_token) VALUES(${session.id},${token}) ON CONFLICT DO NOTHING`;
   return res.json({url:session.url});
  }catch(error){
   console.error('Checkout creation failed',{type:error.type,code:error.code,param:error.param,requestId:error.requestId});
   return res.status(503).json({error:'Checkout could not be started. Please try again in an hour.'});
  }
 }catch{
  return res.status(503).json({error:'The survey is temporarily unavailable. Please try again later.'});
 }
}
