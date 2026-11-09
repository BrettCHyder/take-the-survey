fetch('/api/survey').then(r=>r.json()).then(s=>{
 document.getElementById('support-status').textContent=s.testMode?'We are currently testing. No real money is charged.':s.paymentsEnabled?'One-time payments only. No subscription.':'Paid responses are not open yet.';
 if(s.supportEmail){const a=document.createElement('a');a.href='mailto:'+s.supportEmail;a.textContent=s.supportEmail;document.getElementById('contact').replaceChildren(a)}
}).catch(()=>{document.getElementById('support-status').textContent='Support information is temporarily unavailable. Please try again later.'});
