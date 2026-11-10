import Stripe from 'stripe';
import {payable} from '../lib/core.js';
import {runtimeConfig} from '../lib/config.js';
import {fulfill,db} from '../lib/db.js';
export const config={api:{bodyParser:false}};
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).end();
 const settings=runtimeConfig();
 if(!settings.stripeKey||!settings.webhookSecret)return res.status(503).end();
 let event;
 try{
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>1048576)return res.status(413).end();chunks.push(chunk)}
  event=new Stripe(settings.stripeKey).webhooks.constructEvent(Buffer.concat(chunks),req.headers['stripe-signature'],settings.webhookSecret);
 }catch{return res.status(400).json({error:'Invalid signature'})}
 try{
  if(event.type==='checkout.session.completed'&&payable(event.data.object)){
   const session=event.data.object;
   if(session.livemode===runtimeConfig().testMode)return res.status(400).json({error:'Wrong payment environment'});
   const sql=db();
   // A payment is still recoverable if the original post-checkout DB write failed.
   if(/^[a-f0-9]{64}$/.test(session.client_reference_id||''))await sql`INSERT INTO payments(session_id,browser_token) VALUES(${session.id},${session.client_reference_id}) ON CONFLICT DO NOTHING`;
   const rows=await sql`SELECT session_id FROM payments WHERE session_id=${session.id}`;
   if(!rows.length)return res.status(503).end();
   await fulfill(session);
  }
  return res.json({received:true});
 }catch{return res.status(503).end()}
}
