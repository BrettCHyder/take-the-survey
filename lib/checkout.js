export function checkoutOptions(origin,token,testMode,priceId) {
  return {
    mode:'payment',payment_method_types:['card'],
    branding_settings:{display_name:'One Dollar Survey',background_color:'#f6f5ef',button_color:'#35482c',border_style:'rounded'},
    automatic_tax:{enabled:!testMode},
    line_items:priceId?[{price:priceId,quantity:1}]:[{price_data:{currency:'usd',unit_amount:100,tax_behavior:'inclusive',product_data:{name:'One Dollar Survey — Yes response',description:'One $1 payment. One question. No subscription.'}},quantity:1}],
    metadata:{project:'take-the-survey'},client_reference_id:token,
    payment_intent_data:{description:'One Dollar Survey — one-time Yes response',metadata:{project:'one-dollar-survey'}},
    custom_text:{submit:{message:testMode?'Sandbox test only. No real money will be charged.':'One-time $1 USD payment to submit your Yes response. No subscription. Support and refund policy: '+origin+'/support.html'}},
    expires_at:Math.floor(Date.now()/1000)+1800,
    success_url:origin+'/?payment=success',cancel_url:origin+'/?payment=cancelled'
  };
}
