import Stripe from 'stripe';
import {browser} from '../lib/core.js';
import {db} from '../lib/db.js';
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method)){res.setHeader('Allow','GET, POST');return res.status(405).end()}
 const configured=!!(process.env.DATABASE_URL&&process.env.COOKIE_SECRET?.length>=32);
 const paymentsEnabled=configured&&process.env.PAYMENTS_ENABLED==='true'&&!!process.env.STRIPE_SECRET_KEY&&!!process.env.STRIPE_WEBHOOK_SECRET&&!!process.env.APP_ORIGIN;
 if(!configured)return res.status(req.method==='GET'?200:503).json({configured:false,paymentsEnabled:false,error:'The survey is being set up. Voting opens soon.'});
 try{
 const sql=db();const token=browser(req,res);
 if(req.method==='GET'){const [totals]=await sql`SELECT yes::text,no::text FROM totals WHERE id=1`;const [limit]=await sql`SELECT blocked_until FROM browser_limits WHERE token=${token} AND blocked_until>now()`;return res.json({configured:true,paymentsEnabled,yes:Number(totals.yes),no:Number(totals.no),blockedUntil:limit?.blocked_until||null})}
 if(!process.env.APP_ORIGIN||req.headers.origin!==process.env.APP_ORIGIN)return res.status(403).json({error:'Please submit from the survey website.'});
 const answer=req.body?.answer;if(!['yes','no'].includes(answer))return res.status(400).json({error:'Choose Yes or No.'});
 if(answer==='yes'&&!paymentsEnabled)return res.status(503).json({error:'Payments are not connected yet.'});
 // Atomic reservation prevents simultaneous clicks and replay from counting twice.
 const claim=await sql.begin(async tx=>{const [row]=await tx`INSERT INTO browser_limits(token,blocked_until) VALUES(${token},now()+interval '1 hour') ON CONFLICT(token) DO UPDATE SET blocked_until=EXCLUDED.blocked_until WHERE browser_limits.blocked_until<=now() RETURNING token`;if(row&&answer==='no')await tx`UPDATE totals SET no=no+1 WHERE id=1`;return row});
 if(!claim)return res.status(429).json({error:'You have already submitted or started checkout. Please come back in an hour.'});
 if(answer==='no')return res.json({submitted:true});
 const stripe=new Stripe(process.env.STRIPE_SECRET_KEY);
 try{const session=await stripe.checkout.sessions.create({mode:'payment',payment_method_types:['card'],line_items:[{price_data:{currency:'usd',unit_amount:100,product_data:{name:'One-question survey — Yes response',description:'One $1 payment. No subscription.'}},quantity:1}],metadata:{project:'take-the-survey'},expires_at:Math.floor(Date.now()/1000)+1800,success_url:process.env.APP_ORIGIN+'/?payment=success',cancel_url:process.env.APP_ORIGIN+'/?payment=cancelled'}, {idempotencyKey:token+'-'+claim.token+'-'+Math.floor(Date.now()/3600000)});await sql`INSERT INTO payments(session_id,browser_token) VALUES(${session.id},${token}) ON CONFLICT DO NOTHING`;return res.json({url:session.url})}catch(error){return res.status(503).json({error:'Checkout could not be started. Please try again in an hour.'})}
 }catch(error){return res.status(503).json({error:'The survey is temporarily unavailable. Please try again later.'})}
}
