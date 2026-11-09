import {createHmac, randomBytes, timingSafeEqual, createHash} from 'node:crypto';
export function sign(value,secret){return createHmac('sha256',secret).update(value).digest('hex')}
export function validToken(cookie,secret){if(!cookie)return false;const [value,sig]=cookie.split('.');if(!/^[a-f0-9]{48}$/.test(value||'')||!/^[a-f0-9]{64}$/.test(sig||''))return false;return timingSafeEqual(Buffer.from(sig),Buffer.from(sign(value,secret)))}
export function browser(req,res){const secret=process.env.COOKIE_SECRET;if(!secret||secret.length<32)throw Error('Configuration required');const raw=(req.headers.cookie||'').split('; ').find(x=>x.startsWith('survey_browser='))?.slice(15);const value=validToken(raw,secret)?raw.split('.')[0]:randomBytes(24).toString('hex');res.setHeader('Set-Cookie',`survey_browser=${value}.${sign(value,secret)}; Path=/; Max-Age=7200; HttpOnly; Secure; SameSite=Lax`);return createHash('sha256').update(value).digest('hex')}
export function payable(s){return s.payment_status==='paid'&&s.amount_total===100&&s.currency==='usd'&&s.metadata?.project==='take-the-survey'}
// Short-lived, browser-bound form proof. No database record or fingerprint required.
export function formProof(token,secret,now=Date.now()){const time=String(now);return time+'.'+sign(token+':'+time,secret)}
export function validFormProof(proof,token,secret,now=Date.now()){
 if(typeof proof!=='string')return false;
 const [time,sig,...extra]=proof.split('.');
 if(extra.length||!/^\d{13}$/.test(time||'')||!/^[a-f0-9]{64}$/.test(sig||''))return false;
 const age=now-Number(time);
 return age>=750&&age<=15*60*1000&&timingSafeEqual(Buffer.from(sig),Buffer.from(sign(token+':'+time,secret)));
}
