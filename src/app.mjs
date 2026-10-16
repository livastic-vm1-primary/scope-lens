import './styles.css';
import {analyzeBrief,formatReport,createModelPrompt,validateGeneratedQuestions,SAMPLE_BRIEF_EN,SAMPLE_BRIEF_KO,RULES} from './analyze.mjs';

const $ = id => document.getElementById(id);
const ui = {
  en: {
    eyebrow:'FOR FREELANCERS, MAKERS & SMALL TEAMS',
    heroTitle:'Get clear.\nThen get paid.',
    heroDesc:'A rushed client brief hides expensive unknowns. Check what’s missing in seconds, then ask smarter questions with a tiny open-weight model running on your device.',
    benefit1:'Catch hidden scope', benefit2:'Ask better questions',benefit3:'Keep briefs private',
    sectionLabel:'THE WORKBENCH',workTitle:'Paste a brief. See the gaps.',
    workDesc:'Sample details are fictional. Enter a real brief only if you’re comfortable processing it in your own browser.',
    chip:'NO API KEYS REQUIRED',brief:'CLIENT BRIEF',privacy:'Heuristic checks run offline. AI weights download only when requested; your brief is not sent to a hosted AI API.',
    clear:'Clear',scan:'Scan for scope gaps',ai:'Draft with local AI',emptyTitle:'Answers before assumptions.',
    emptyDesc:'Your scope report will appear here after you run a check.',
    signal:'Ambiguity signal',scoreDisclaimer:'Not a contract risk rating. Keyword matches can miss nuance.',
    found:'Topics found',missing:'To clarify',words:'Words scanned',
    gaps:'TOPICS TO CLARIFY',questions:'SUGGESTED QUESTIONS',aiTitle:'LOCAL AI SUGGESTIONS',
    download:'Export notes (.md) ↓',copy:'Copy questions ↗',
    footnote:'Method note: the first scan checks keyword signals, not contractual sufficiency. The AI text may be inaccurate. Verify with the client.',
    howTitle:'No cloud.\nNo guessing.',howDesc:'The boring but costly questions often fall through the cracks. ScopeLens combines transparent checks with optional local model inference.',
    f1:'Transparent first pass',f1d:'Eight visible topics. Each gap has a fixed, editable client question. The heuristic scan needs no downloads or keys.',
    f2:'Open-weight second opinion',f2d:'SmolLM2-360M-Instruct runs on your device with Transformers.js after model weights download. Suggestions are not fact checks.',
    f3:'Take it to your workflow',f3d:'Export Markdown notes, clarify the scope with your client, and then use your own quoting process. We do not store briefs on a server.',
    ctaTitle:'The most expensive word\nin a brief is “assume.”',ctaBody:'This prototype is free and open source. Want a tailored checklist for your agency? Let’s discuss a scoped brief—no checkout here.',
    contact:'Discuss custom workflows ↗',footer:'Original prototype · Client text stays on device · Model weights download from Hugging Face on demand.',
    inputPlaceholder:'Paste a project request here... (20–8000 characters)',
    reportTitle:'Topics to clarify before quoting', labelHigh:'MANY GAPS',labelMedium:'SOME GAPS',labelLow:'FEWER GAPS',
    aiIdle:'Optional: choose “Draft with local AI” to download an open-weight model and generate a draft. Review every question.',
    aiWorking:'Preparing model download… first use may take a minute or more.',
    aiReady:'Open-weight model loaded locally. Drafting questions…',
    aiBusy:'Working…',
    aiFailed:'The local AI output was unavailable or unreliable. The rule-based questions above are still ready to use.',
    aiDone:'Local AI suggestions generated. Review carefully before sharing.',
    invalid:'Enter at least 20 characters of a real or sample brief.',
    scanDone:'Checked the brief using transparent keyword signals.',
    modelLoad:'Downloading model weights once, about 300 MB. Do not close this tab.',
    clearStatus:'Cleared; no brief has been saved.',
    copyDone:'Questions copied to clipboard.',
    copyFailed:'Clipboard unavailable. Use Export notes.',
    exportDone:'Downloaded the Markdown report.',
    noGaps:'No missing topics detected by keywords. Verify the actual meaning with your customer.',
    noQuestions:'No automatic questions suggested; ask your client to confirm assumptions.'
  },
  ko: {
    eyebrow:'프리랜서·소규모 팀을 위한 범위 점검 도구',
    heroTitle:'확실히 묻고.\n정확히 견적하세요.',
    heroDesc:'급히 전달받은 의뢰서에는 비싼 누락 조건이 숨어 있습니다. 키워드 점검으로 확인할 사항을 찾고, 기기에서 실행되는 공개 모델로 추가 질문 초안을 작성하세요.',
    benefit1:'숨은 범위 찾기',benefit2:'적절한 질문',benefit3:'문서는 내 기기에',
    sectionLabel:'작업 공간',workTitle:'의뢰서를 넣고 누락 항목을 확인하세요.',
    workDesc:'예시는 가상의 의뢰입니다. 입력된 원문은 브라우저에서 처리됩니다.',
    chip:'API 키 불필요',brief:'고객 의뢰서',privacy:'기본 점검은 오프라인입니다. 선택 시 AI 모델 가중치만 내려받으며 의뢰서 원문을 외부 AI API로 보내지 않습니다.',
    clear:'초기화',scan:'계약 범위 점검',ai:'로컬 AI 질문 생성',emptyTitle:'추측하기 전에 확인하세요.',
    emptyDesc:'범위 점검 버튼을 누르면 보고서가 표시됩니다.',
    signal:'누락 가능성 지표',scoreDisclaimer:'계약 위험도 점수가 아닙니다. 단순 키워드로는 맥락을 놓칠 수 있습니다.',
    found:'감지된 항목',missing:'확인 필요',words:'단어 수',
    gaps:'추가 확인 항목',questions:'권장 질문',aiTitle:'로컬 AI 추천 질문',
    download:'메모 내보내기 (.md) ↓',copy:'질문 복사 ↗',
    footnote:'본 도구는 키워드 기반 참고용이며 계약·법률·세무 검증이 아닙니다. AI 초안도 직접 사실관계를 확인하세요.',
    howTitle:'클라우드 없이.\n막연한 추측 없이.',howDesc:'작지만 놓치기 쉬운 조건을 검토합니다. 명확한 규칙 점검과 선택적 온디바이스 AI를 결합했습니다.',
    f1:'명확한 1차 점검',f1d:'8개 범위를 공개된 규칙으로 검사하며, 별도 다운로드나 API 키 없이 질문을 제공합니다.',
    f2:'오픈 모델 2차 의견',f2d:'SmolLM2-360M-Instruct 모델을 내려받은 뒤 Transformers.js로 기기 안에서 실행합니다. 답변은 반드시 검토하세요.',
    f3:'실제 견적 업무에 적용',f3d:'Markdown 메모를 내려받아 고객과 업무를 확정하고, 기존 견적·청구 절차에 반영하세요. 저희 서버에 의뢰서를 저장하지 않습니다.',
    ctaTitle:'가장 비싼 단어는\n“그럴 줄 알았죠.”',ctaBody:'무료 오픈소스 프로토타입입니다. 대행사에 필요한 맞춤형 체크리스트는 범위를 정해 문의하세요. 결제는 받지 않습니다.',
    contact:'맞춤 도구 문의 ↗',footer:'오리지널 프로토타입 · 문서는 로컬 처리 · 모델 가중치는 필요할 때만 다운로드',
    inputPlaceholder:'의뢰 내용을 입력하세요… (20~8000자)',
    reportTitle:'견적 전에 확인할 조건',labelHigh:'누락 많음',labelMedium:'일부 누락',labelLow:'누락 적음',
    aiIdle:'선택 기능: 로컬 AI 버튼을 누르면 공개 모델을 다운로드해 질문 초안을 만듭니다. 출력은 직접 검토하세요.',
    aiWorking:'로컬 모델을 준비하고 있습니다. 처음에는 수분이 걸릴 수 있습니다.',
    aiReady:'로컬 모델 로드 완료. 질문을 생성 중입니다.',
    aiBusy:'처리 중…',
    aiFailed:'AI가 사용 불가 상태이거나 출력 품질이 불충분합니다. 위의 규칙 기반 확인 질문을 사용하세요.',
    aiDone:'로컬 AI 초안 생성 완료. 고객에게 보내기 전에 확인하세요.',
    invalid:'20자 이상의 의뢰 내용을 입력하세요.',
    scanDone:'공개된 키워드 규칙으로 의뢰서를 점검했습니다.',
    modelLoad:'모델 파일을 최초 1회 약 300MB 내려받습니다. 탭을 닫지 마세요.',
    clearStatus:'초기화했습니다. 의뢰서는 저장되지 않았습니다.',
    copyDone:'질문을 복사했습니다.',
    copyFailed:'클립보드에 접근할 수 없습니다. 내보내기를 이용하세요.',
    exportDone:'Markdown 보고서를 내려받았습니다.',
    noGaps:'키워드로 감지된 누락 항목이 없습니다. 실제 합의 내용은 추가 확인하세요.',
    noQuestions:'자동 추천 질문이 없습니다. 고객에게 핵심 가정을 확인하세요.'
  }
};

const langButton = $('lang');
let lang = 'en';
let analysis = null;
let aiGenerated = '';
let currentBrief = '';
let modelPromise = null;
let aiBusy = false;
const defaultAIMessage = () => ui[lang].aiIdle;

function display(id,text) {
  const element=$(id);
  if(element) element.textContent=text;
}
function htmlSafeLinebreak(element,text) {
  element.replaceChildren();
  String(text).split('\n').forEach((line,i) => {
    if(i)element.append(document.createElement('br'));
    element.append(document.createTextNode(line));
  });
}
function setStatus(text) {
  $('model-status').textContent=text;
}
function updateLanguage() {
  document.documentElement.lang=lang;
  const t=ui[lang];
  for (const element of document.querySelectorAll('[data-k]')) {
    const key=element.dataset.k;
    if(t[key]===undefined)continue;
    const value=key==='heroTitle'||key==='howTitle'||key==='ctaTitle'?t[key].split('\n'):null;
    if(value) { if(key==='heroTitle'){element.replaceChildren(document.createTextNode(value[0]),document.createElement('br'));const em=document.createElement('em');em.textContent=value[1]||'';element.append(em);} else htmlSafeLinebreak(element,t[key]); }
    else element.textContent=t[key];
  }
  $('brief-text').placeholder=t.inputPlaceholder;
  langButton.textContent=(lang==='en'?'KR ↗':'EN ↗');
  langButton.setAttribute('aria-label',lang==='en'?'한국어로 전환':'Switch to English');
  document.title=lang==='en'?'ScopeLens — Know what to ask before you quote.':'ScopeLens — 견적 전에 확인할 사항';
  if (analysis?.valid) renderReport();
  else display('ai-output',defaultAIMessage());
}
function updateCount() {
  const size=$('brief-text').value.length;
  display('count',size.toLocaleString()+' / 8,000');
}
function renderReport() {
  if(!analysis?.valid) return;
  $('empty').classList.add('hidden');
  $('report').classList.remove('hidden');
  const t=ui[lang];
  display('report-title',t.reportTitle);
  display('score',analysis.riskScore);
  display('found',analysis.covered.length);
  display('missing',analysis.gaps.length);
  display('word-count',analysis.words);
  $('bar').style.width=analysis.riskScore+'%';
  const badge=$('risk-badge');
  badge.dataset.risk=analysis.riskLabel;
  badge.textContent=analysis.riskLabel==='high'?t.labelHigh:analysis.riskLabel==='medium'?t.labelMedium:t.labelLow;
  const gapList=$('gaps-list');gapList.replaceChildren();
  for(const rule of RULES){
    const isFound=analysis.covered.some(x=>x.id===rule.id);
    const entry=document.createElement('div');
    entry.className='gap'+(isFound?' found':'');
    const icon=document.createElement('i');
    icon.textContent=isFound?'✓':'!';
    const label=document.createElement('span');
    label.textContent=lang==='ko'?rule.ko:rule.label;
    entry.append(icon,label);
    gapList.append(entry);
  }
  const questions=$('questions-list'); questions.replaceChildren();
  for(const item of analysis.questions){
    const li=document.createElement('li');
    li.textContent=lang==='ko'
      ?(RULES.find(x=>x.id===item.id)?.questionKo??item.question)
      :(RULES.find(x=>x.id===item.id)?.question??item.question);
    questions.append(li);
  }
  if(!analysis.questions.length){
    const li=document.createElement('li');li.textContent=t.noQuestions;questions.append(li);
  }
  display('ai-output',aiGenerated || t.aiIdle);
}
function scan(showStatus=true){
  const text=$('brief-text').value;
  if(!analysis||text!==currentBrief){
    currentBrief=text;
    aiGenerated='';
  }
  analysis=analyzeBrief(text,lang);
  if(!analysis.valid){
    $('report').classList.add('hidden');
    $('empty').classList.remove('hidden');
    if(showStatus) setStatus(ui[lang].invalid);
    return false;
  }
  renderReport();
  if(showStatus)setStatus(ui[lang].scanDone);
  return true;
}
function chooseLanguage(){
  lang=lang==='en'?'ko':'en';
  if(analysis?.valid){
    analysis=analyzeBrief(currentBrief,lang);
  }
  updateLanguage();
}
function downloadMarkdown(){
  if(!analysis?.valid)return;
  const content=formatReport(currentBrief,analysis,lang,aiGenerated);
  const data=new Blob([content],{type:'text/markdown;charset=utf-8'});
  const url=URL.createObjectURL(data);
  const a=document.createElement('a');
  a.href=url;a.download='scopelens-scope-notes.md';
  document.body.append(a);
  a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
  setStatus(ui[lang].exportDone);
}
async function copyQuestions(){
  if(!analysis?.valid)return;
  const questions=analysis.questions.map((item,i)=>(i+1)+'. '+(lang==='ko'
    ?(RULES.find(x=>x.id===item.id)?.questionKo??item.question)
    :(RULES.find(x=>x.id===item.id)?.question??item.question)));
  const block=questions.join('\n')+(aiGenerated?'\n\nLocal AI draft (verify):\n'+aiGenerated:'');
  try {
    if(!navigator.clipboard?.writeText)throw Error('Clipboard API not available');
    await navigator.clipboard.writeText(block);
    setStatus(ui[lang].copyDone);
  }catch{setStatus(ui[lang].copyFailed);}
}
async function runLocalAI(){
  if(aiBusy)return;
  if(!scan(false)){setStatus(ui[lang].invalid);return;}
  aiBusy=true;
  $('ai').disabled=true;
  const pinned=currentBrief;
  const pinnedLang=lang;
  aiGenerated='';
  renderReport();
  setStatus(ui[lang].modelLoad);
  const output=$('ai-output');
  output.textContent=ui[lang].aiWorking;
  try{
    if(!modelPromise){
      modelPromise=(async()=>{
        const {pipeline,env}=await import('@huggingface/transformers');
        env.allowRemoteModels=true;
        env.allowLocalModels=false;
        const runner=await pipeline('text-generation','onnx-community/SmolLM2-360M-Instruct-ONNX',{
          dtype:'q4',
          device:'wasm',
          progress_callback:info=>{
            if(info.status==='progress'&&typeof info.progress==='number'&&info.file&&pinned===$('brief-text').value){
              const percentage=Math.round(info.progress);
              if(percentage%10===0) setStatus(ui[lang].modelLoad+' '+percentage+'%');
            }
          }
        });
        return runner;
      })().catch(e=>{modelPromise=null;throw e});
    }
    const model=await modelPromise;
    if(pinned!==$('brief-text').value)throw Error('Brief changed while AI was loading');
    setStatus(ui[lang].aiReady);
    const messages=createModelPrompt(pinned,analysis,pinnedLang);
    const raw=await model(messages,{max_new_tokens:130,do_sample:false,return_full_text:false});
    const generated=raw?.[0]?.generated_text;
    let reply=typeof generated==='string'?generated
      :Array.isArray(generated)?(generated.filter(m=>m.role==='assistant').at(-1)?.content??''):'';
    reply=String(reply||'').trim().slice(0,1700);
    if(!validateGeneratedQuestions(reply))throw Error('Local model generated repetitive or unusable questions');
    if(pinned!==$('brief-text').value)throw Error('Brief changed after AI generation');
    aiGenerated=reply;
    output.textContent=reply;
    setStatus(ui[lang].aiDone);
  }catch(error){
    aiGenerated='';
    output.textContent=ui[lang].aiFailed;
    setStatus(ui[lang].aiFailed);
    console.warn('ScopeLens local model unavailable or draft rejected',String(error).slice(0,200));
  }finally{
    aiBusy=false;
    $('ai').disabled=false;
  }
}
langButton.addEventListener('click',chooseLanguage);
$('brief-text').addEventListener('input',()=>{
  updateCount();
  if($('brief-text').value!==currentBrief){
    analysis=null;
    aiGenerated='';
    $('report').classList.add('hidden');
    $('empty').classList.remove('hidden');
    setStatus('');
  }
});
$('sample-en').addEventListener('click',()=>{
  $('brief-text').value=SAMPLE_BRIEF_EN;lang='en';updateCount();updateLanguage();scan();
});
$('sample-ko').addEventListener('click',()=>{
  $('brief-text').value=SAMPLE_BRIEF_KO;lang='ko';updateCount();updateLanguage();scan();
});
$('clear').addEventListener('click',()=>{
  $('brief-text').value='';currentBrief='';analysis=null;aiGenerated='';
  $('report').classList.add('hidden');$('empty').classList.remove('hidden');
  updateCount();display('ai-output',defaultAIMessage());
  setStatus(ui[lang].clearStatus);
});
$('analyze').addEventListener('click',()=>scan());
$('ai').addEventListener('click',runLocalAI);
$('download').addEventListener('click',downloadMarkdown);
$('copy').addEventListener('click',copyQuestions);
updateLanguage();updateCount();
