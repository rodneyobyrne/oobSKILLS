(function(){
'use strict';

const engine=window.OobFitCheckEngine;
const form=document.querySelector('[data-fit-form]');
if(!engine||!form)return;

const q=(selector)=>document.querySelector(selector);
const result=q('[data-fit-result]');
const validation=q('[data-fit-validation]');
const missingTitle=q('[data-fit-missing-title]');
const missingCopy=q('[data-fit-missing-copy]');
const taskChoices=form.querySelector('[data-fit-task-choices]');
const groups=[...form.querySelectorAll('fieldset:not(.fit-task-choices)')];
const submit=form.querySelector('[data-fit-submit]');
const workInput=form.querySelector('[name="workLabel"]');
const urlInput=form.querySelector('[name="contextUrl"]');
const researchStatus=q('[data-fit-research-status]');
const copyButton=q('[data-fit-copy-result]');
const printButton=q('[data-fit-print]');
const status=q('[data-fit-status]');
const reduce=window.matchMedia?window.matchMedia('(prefers-reduced-motion: reduce)'):{matches:false};
const productionHost='skills.oobcreative.com';

let current=null;
let researchRun=0;

const f={
  kicker:q('[data-fit-kicker]'),
  score:q('[data-fit-score]'),
  title:q('[data-fit-title]'),
  summary:q('[data-fit-copy]'),
  profile:q('[data-fit-profile]'),
  why:q('[data-fit-why]'),
  dimensions:q('[data-fit-dimensions]'),
  role:q('[data-fit-role]'),
  human:q('[data-fit-human]'),
  watch:q('[data-fit-watch]'),
  factors:q('[data-fit-factors]'),
  research:q('[data-fit-research]'),
  researchEvidence:q('[data-fit-research-evidence]'),
  blockers:q('[data-fit-blockers]'),
  blockerList:q('[data-fit-blocker-list]'),
  nextTitle:q('[data-fit-next-title]'),
  nextCopy:q('[data-fit-next-copy]'),
  plan:q('[data-fit-plan]'),
  nextLink:q('[data-fit-next-link]'),
  supportLink:q('[data-fit-support-link]'),
  work:q('[data-fit-work]')
};

function addDesc(el,id){
  const ids=new Set((el.getAttribute('aria-describedby')||'').split(/\s+/).filter(Boolean));
  ids.add(id);
  el.setAttribute('aria-describedby',[...ids].join(' '));
}

function removeDesc(el,id){
  const ids=(el.getAttribute('aria-describedby')||'').split(/\s+/).filter((x)=>x&&x!==id);
  if(ids.length)el.setAttribute('aria-describedby',ids.join(' '));
  else el.removeAttribute('aria-describedby');
}

function clearValidation(){
  taskChoices.removeAttribute('aria-invalid');
  taskChoices.querySelectorAll('input').forEach((x)=>{
    x.removeAttribute('aria-invalid');
    removeDesc(x,validation.id);
  });
  groups.forEach((g)=>{
    g.removeAttribute('aria-invalid');
    g.querySelectorAll('input').forEach((x)=>{
      x.removeAttribute('aria-invalid');
      removeDesc(x,validation.id);
    });
  });
  const job=form.querySelector('[name="jobType"]');
  job.removeAttribute('aria-invalid');
  removeDesc(job,validation.id);
  workInput.removeAttribute('aria-invalid');
  removeDesc(workInput,validation.id);
  validation.hidden=true;
}

function validate(){
  const missing=groups.filter((g)=>!g.querySelector('input:checked'));
  const tasks=form.querySelectorAll('[name="task"]:checked');
  const job=form.querySelector('[name="jobType"]');
  clearValidation();

  if(!workInput.value.trim()){
    missing.push(workInput);
    workInput.setAttribute('aria-invalid','true');
    addDesc(workInput,validation.id);
  }
  if(!tasks.length){
    missing.push(taskChoices);
    taskChoices.setAttribute('aria-invalid','true');
    taskChoices.querySelectorAll('input').forEach((x)=>{
      x.setAttribute('aria-invalid','true');
      addDesc(x,validation.id);
    });
  }
  if(!job.value){
    missing.push(job);
    job.setAttribute('aria-invalid','true');
    addDesc(job,validation.id);
  }
  missing.filter((x)=>x.tagName==='FIELDSET'&&x!==taskChoices).forEach((g)=>{
    g.setAttribute('aria-invalid','true');
    const first=g.querySelector('input');
    first.setAttribute('aria-invalid','true');
    addDesc(first,validation.id);
  });

  if(!missing.length)return true;

  result.hidden=true;
  missingTitle.textContent=`${missing.length} ${missing.length===1?'answer is':'answers are'} still needed.`;
  missingCopy.textContent='Complete the highlighted questions, then review this possible use again.';
  validation.hidden=false;
  validation.focus({preventScroll:true});
  validation.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'center'});
  return false;
}

function stateLabel(state){
  return state==='strong'?'Clear':state==='mixed'?'Check':'Resolve';
}

function renderDimensions(items){
  f.dimensions.replaceChildren();
  items.forEach((item)=>{
    const article=document.createElement('article');
    const label=document.createElement('p');
    const detail=document.createElement('strong');
    article.className='fit-dimension';
    article.dataset.state=item.state;
    label.textContent=item.label;
    detail.textContent=item.detail;
    article.append(label,detail);
    f.dimensions.append(article);
  });
}

function renderFactors(items){
  f.factors.replaceChildren();
  items.forEach((item)=>{
    const article=document.createElement('article');
    const left=document.createElement('div');
    const heading=document.createElement('h4');
    const detail=document.createElement('p');
    const meaning=document.createElement('p');
    const badge=document.createElement('span');
    article.className='fit-factor-row';
    article.dataset.state=item.state;
    heading.textContent=item.label;
    detail.textContent=item.detail;
    left.append(heading,detail);
    meaning.className='fit-factor-meaning';
    meaning.textContent=item.meaning;
    badge.className='fit-factor-state';
    badge.textContent=stateLabel(item.state);
    article.append(left,meaning,badge);
    f.factors.append(article);
  });
}

function hideResearchPanel(){
  if(f.research)f.research.hidden=true;
  if(f.researchEvidence)f.researchEvidence.replaceChildren();
}

function renderBlockers(items){
  f.blockerList.replaceChildren();
  f.blockers.hidden=!items.length;
  items.forEach((item)=>{
    const article=document.createElement('article');
    const heading=document.createElement('h4');
    const copy=document.createElement('p');
    article.className='fit-blocker-card';
    heading.textContent=item.title;
    copy.textContent=item.detail;
    article.append(heading,copy);
    f.blockerList.append(article);
  });
}

function renderPlan(items){
  f.plan.replaceChildren();
  items.forEach((item)=>{
    const li=document.createElement('li');
    const number=document.createElement('span');
    const body=document.createElement('div');
    const heading=document.createElement('h4');
    const instruction=document.createElement('p');
    const done=document.createElement('p');
    const strong=document.createElement('strong');
    li.className='fit-plan-step';
    number.className='fit-plan-number';
    number.textContent=item.number;
    heading.textContent=item.action;
    instruction.textContent=item.instruction;
    done.className='fit-done-when';
    strong.textContent='Done when: ';
    done.append(strong,document.createTextNode(item.doneWhen));
    body.append(heading,instruction,done);
    li.append(number,body);
    f.plan.append(li);
  });
}

function render(brief){
  current=brief;
  f.kicker.textContent=brief.kicker;
  f.work.textContent=brief.workLabel;
  f.score.textContent=brief.score;
  f.title.textContent=brief.title;
  f.summary.textContent=brief.summary;
  f.profile.textContent=brief.profile;
  f.why.textContent=brief.why;
  f.role.textContent=brief.role;
  f.human.textContent=brief.humanResponsibility;
  f.watch.textContent=brief.watch;
  f.nextTitle.textContent=brief.next.title;
  f.nextCopy.textContent=brief.next.copy;
  f.nextLink.textContent=brief.next.label;
  f.nextLink.href=brief.next.href;
  f.supportLink.href=brief.next.href;
  renderDimensions(brief.factors);
  renderFactors(brief.factors);
  hideResearchPanel();
  renderBlockers(brief.blockers);
  renderPlan(brief.plan);
  status.textContent='';
  result.hidden=false;
  result.focus({preventScroll:true});
  result.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'start'});
}

async function researchPage(value,context){
  const normalized=engine.normalizePublicUrl(value);
  if(!normalized)throw new Error('Please enter a valid public http or https URL.');
  const ctrl=new AbortController();
  const timer=setTimeout(()=>ctrl.abort(),8000);
  try{
    const res=await fetch(`https://r.jina.ai/${normalized}`,{
      headers:{Accept:'text/plain'},
      signal:ctrl.signal
    });
    if(!res.ok)throw new Error(`Public page review returned ${res.status}.`);
    const research=engine.analyzePublicPage(await res.text(),normalized,context);
    if(!research)throw new Error('The public page did not return enough readable content to evaluate.');
    return research;
  }finally{
    clearTimeout(timer);
  }
}

function briefText(brief){
  const lines=[
    'AI Task Fit Brief','',
    `Work checked: ${brief.workLabel}`,
    `Decision: ${brief.score}`,
    brief.title,
    brief.summary,'',
    'Best role for AI',brief.role,'',
    'Keep human responsibility here',brief.humanResponsibility,'',
    'What drove this result'
  ];
  brief.factors.forEach((item)=>lines.push(`${item.label} — ${item.detail}: ${item.meaning}`));
  if(brief.research)lines.push('',`Public page context used: ${brief.research.host}.`);
  if(brief.blockers.length){
    lines.push('','Resolve before testing');
    brief.blockers.forEach((item)=>lines.push(`${item.title}: ${item.detail}`));
  }
  lines.push('','What to do next');
  brief.plan.forEach((item)=>lines.push(`${item.number}. ${item.action}`,item.instruction,`Done when: ${item.doneWhen}`));
  lines.push('',`${brief.next.title} ${brief.next.copy}`);
  return lines.join('\n');
}

function normalizedWorkLabel(value){
  return value.trim().replace(/\s+/g,' ').slice(0,120);
}

async function refineWithPublicPage({run,url,answers,tasks,jobType,context,workLabel}){
  if(!url)return;

  if(window.location.hostname!==productionHost){
    researchStatus.textContent='Public-page refinement runs on the live skills.oobcreative.com site. Your fit result is complete from your answers.';
    return;
  }

  researchStatus.textContent='Your fit result is ready. Checking the public page in the background…';
  try{
    const research=await researchPage(url,context);
    if(run!==researchRun||result.hidden)return;

    const enriched=engine.evaluate({answers,tasks,jobType,research});
    enriched.workLabel=workLabel;
    current=enriched;
    renderPlan(enriched.plan);
    hideResearchPanel();
    researchStatus.textContent=`Page context used: ${research.host}.`;
    status.textContent='Public page context was used to sharpen the next-step guidance.';
  }catch{
    if(run!==researchRun)return;
    researchStatus.textContent='We could not read that public page. Your fit result is complete based on your answers.';
  }
}

form.addEventListener('submit',(event)=>{
  event.preventDefault();
  if(!validate())return;

  const run=++researchRun;
  const data=new FormData(form);
  const a=Object.fromEntries(data);
  const tasks=data.getAll('task');
  const context={tasks,jobType:a.jobType};
  const workLabel=normalizedWorkLabel(a.workLabel);

  submit.disabled=true;
  submit.setAttribute('aria-busy','true');
  researchStatus.textContent='';

  try{
    const brief=engine.evaluate({answers:a,tasks,jobType:a.jobType,research:null});
    brief.workLabel=a.workLabel.trim().replace(/\s+/g,' ').slice(0,120);
    render(brief);
  }catch{
    researchStatus.textContent='The brief could not be built in this browser. Your answers were not sent. Please try again or clear the form.';
    submit.disabled=false;
    submit.removeAttribute('aria-busy');
    return;
  }

  submit.disabled=false;
  submit.removeAttribute('aria-busy');

  if(a.contextUrl){
    refineWithPublicPage({
      run,
      url:a.contextUrl,
      answers:a,
      tasks,
      jobType:a.jobType,
      context,
      workLabel
    });
  }
});

form.addEventListener('change',(event)=>{
  researchRun++;
  const group=event.target.closest('fieldset');
  if(event.target.matches('[name="task"]')){
    taskChoices.removeAttribute('aria-invalid');
    taskChoices.querySelectorAll('input').forEach((x)=>{
      x.removeAttribute('aria-invalid');
      removeDesc(x,validation.id);
    });
  }
  if(event.target.matches('[name="jobType"]')){
    event.target.removeAttribute('aria-invalid');
    removeDesc(event.target,validation.id);
  }
  if(group){
    group.removeAttribute('aria-invalid');
    group.querySelectorAll('input').forEach((x)=>{
      x.removeAttribute('aria-invalid');
      removeDesc(x,validation.id);
    });
  }
  if(!groups.some((x)=>x.getAttribute('aria-invalid')==='true'))validation.hidden=true;
  if(!result.hidden)result.hidden=true;
  current=null;
  status.textContent='';
});

workInput.addEventListener('input',()=>{
  researchRun++;
  workInput.removeAttribute('aria-invalid');
  removeDesc(workInput,validation.id);
  if(!result.hidden)result.hidden=true;
  current=null;
  status.textContent='';
});

urlInput.addEventListener('input',()=>{
  researchRun++;
  researchStatus.textContent=urlInput.value?'Only this public URL will be sent for page review. Your assessment answers stay in this browser.':'';
});

printButton.addEventListener('click',()=>window.print());

copyButton.addEventListener('click',async()=>{
  if(!current)return;
  try{
    await navigator.clipboard.writeText(briefText(current));
    status.textContent='AI Task Fit Brief copied.';
  }catch{
    status.textContent='Copy was not available in this browser. Use Save free result as PDF instead.';
  }
});

form.addEventListener('reset',()=>setTimeout(()=>{
  researchRun++;
  clearValidation();
  result.hidden=true;
  current=null;
  researchStatus.textContent='';
  status.textContent='';
  submit.disabled=false;
  submit.removeAttribute('aria-busy');
  const first=form.querySelector('input');
  first.scrollIntoView({behavior:reduce.matches?'auto':'smooth',block:'center'});
  first.focus({preventScroll:true});
},0));

})();
