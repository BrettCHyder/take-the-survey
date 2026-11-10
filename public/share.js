const surveyShare={title:'One Dollar Survey',text:'Would you pay a dollar to take this survey? No is free. Yes is an actual dollar. That’s the whole survey.',url:'https://onedollarsurvey.com/'};
const shareStatus=document.getElementById('share-status');
const shareButton=document.getElementById('share-survey');
if(navigator.share){shareButton.hidden=false;shareButton.addEventListener('click',async()=>{try{await navigator.share(surveyShare)}catch(error){if(error.name!=='AbortError')shareStatus.textContent='Could not open sharing. You can copy the link instead.'}})}
document.getElementById('copy-survey').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(surveyShare.url);shareStatus.textContent='Link copied. Thanks for passing the question along.'}catch{document.getElementById('share-fallback').hidden=false;const link=document.getElementById('share-link');link.focus();link.select();shareStatus.textContent='Select and copy the link below.'}});
