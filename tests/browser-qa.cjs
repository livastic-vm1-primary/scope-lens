const assert=require('node:assert/strict');
const fs=require('node:fs/promises');
const http=require('node:http');
const path=require('node:path');
const {chromium,devices}=require('playwright-core');
const ROOT=path.resolve(__dirname,'../docs');
const ARTIFACT_DIR=path.resolve(__dirname,'../test-artifacts');
const TYPES={'.html':'text/html;charset=utf-8','.js':'text/javascript;charset=utf-8','.css':'text/css;charset=utf-8','.svg':'image/svg+xml','.wasm':'application/wasm'};
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,'http://localhost');
  const pathname=decodeURIComponent(url.pathname);
  if(!pathname.startsWith('/scope-lens/')){res.writeHead(404);res.end();return;}
  const rel=pathname.slice('/scope-lens/'.length)||'index.html';
  if(rel.includes('..')){res.writeHead(400);res.end();return;}
  const file=path.join(ROOT,rel);
  if(!file.startsWith(ROOT+path.sep)){res.writeHead(403);res.end();return;}
  const buf=await fs.readFile(file);
  res.writeHead(200,{'Content-Type':TYPES[path.extname(file)]||'application/octet-stream','Content-Length':buf.length,'Cache-Control':'no-store'});
  res.end(buf);
 }catch(e){res.writeHead(404);res.end();}
});
(async()=>{
 await fs.mkdir(ARTIFACT_DIR,{recursive:true});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port+'/scope-lens/';
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROME_PATH||'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const errors=[],remote=[];
 try{
  const page=await browser.newPage({viewport:{width:1440,height:900},acceptDownloads:true});
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',req=>{if(!req.url().startsWith('http://127.0.0.1:'))remote.push(req.url())});
  const r=await page.goto(url,{waitUntil:'networkidle',timeout:20000});
  assert.equal(r.status(),200);
  assert.match(await page.title(),/ScopeLens/);
  assert.match(await page.locator('#empty').innerText(),/Answers before assumptions/);
  await page.locator('#sample-en').click();
  assert.equal(await page.locator('#report').isVisible(),true);
  assert.equal(await page.locator('#brief-text').inputValue().then(x=>x.includes('bakery')),true);
  let total=await page.locator('#score').innerText();
  assert.ok(+total>0&&+total<=100);
  assert.ok(await page.locator('#questions-list li').count()>0);
  const downloadPromise=page.waitForEvent('download');
  await page.locator('#download').click();
  const dl=await downloadPromise;
  assert.equal(dl.suggestedFilename(),'scopelens-scope-notes.md');
  const report=await fs.readFile(await dl.path(),'utf8');
  assert.match(report,/Ambiguity score|Heuristic ambiguity score/);
  await page.locator('#sample-ko').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'ko');
  assert.match(await page.locator('#report-title').innerText(),/견적/);
  assert.ok((await page.locator('#questions-list').innerText()).match(/[가-힣]/u));
  await page.locator('#lang').click();
  assert.equal(await page.locator('html').getAttribute('lang'),'en');
  await page.locator('#brief-text').fill('<img src=x onerror=alert(1)> A freelancer wants a modern landing page but no terms and no deadline.');
  await page.locator('#analyze').click();
  assert.equal(await page.locator('#results img').count(),0);
  assert.ok((await page.locator('#score').innerText())!=='' );
  await page.screenshot({path:path.join(ARTIFACT_DIR,'desktop.png'),fullPage:true});
  const desktopOverflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  const mobile=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  mobile.on('pageerror',e=>errors.push('mobile:'+e.message));
  const mr=await mobile.goto(url,{waitUntil:'networkidle',timeout:20000});
  assert.equal(mr.status(),200);
  await mobile.locator('#sample-en').click();
  const mobileOverflow=await mobile.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
  await mobile.screenshot({path:path.join(ARTIFACT_DIR,'mobile.png'),fullPage:true});
  await page.locator('#clear').click();
  assert.equal(await page.locator('#report').isVisible(),false);
  assert.equal(await page.locator('#brief-text').inputValue(),'');
  const result={baseUrl:url,http:r.status(),mobileHttp:mr.status(),tests:['local served bundle','empty state','sample scan','weighted score','questions','markdown export','Korean labels','English toggle','HTML escaping','clear form','mobile render','network isolation'],desktopOverflow,mobileOverflow,remoteRequests:remote,errors,passed:mobileOverflow<=2&&desktopOverflow<=2&&remote.length===0&&errors.length===0};
  console.log('QA',JSON.stringify(result));
  if(!result.passed)process.exitCode=3;
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error('QA_ERROR',e.stack);server.close();process.exitCode=1});
