// 급탕량·보일러 출력 산정 시스템 매뉴얼 화면 캡처 — usage: node capture_hws.js <repoDir> <outDir>
// 규격: 1440×900 · DSF 1.25 · _marks.json(번호 배지 % 좌표) · _example.json(예제 검증값 — 앱에서 읽음)
const {chromium}=require(process.env.MM_PW||'playwright');const fs=require('fs');const path=require('path');const {setup,server}=require('./serve');
const repo=path.resolve(process.argv[2]),out=path.resolve(process.argv[3]);fs.mkdirSync(out,{recursive:true});
const VW=1440,VH=900,DSF=1.25,PORT=8897;
/* 예제 A = 공동주택 · 거주자 300명 · 16 h · 60 / 10 / 42 ℃ · 효율 90 % · 여유율 20 %
   예제 B = 사무소 · 재실자 100명 · 8 h · 같은 온도 · 효율 · 여유율 */
const FREEZE=`(()=>{const T=new Date(2026,9,13,10,0,0).getTime();const D=Date;class F extends D{constructor(...a){if(a.length)super(...a);else super(T);}static now(){return T;}}window.Date=F;window.alert=()=>{};window.confirm=()=>true;try{localStorage.clear();['pwa-dismissed','pwa-dismissed-geuptang','pwa-welcome','pwa-banner-dismissed'].forEach(k=>localStorage.setItem(k,'1'))}catch(e){}})()`;
const HIDE='#pwa-banner,#pwa-install-banner,.pwa-banner,#ios-modal,#toast,.toast{display:none!important}';
const HELP=`window.__vis=e=>e&&e.getClientRects().length>0;
window.__card=t=>{const h=[...document.querySelectorAll('.card-tit')].find(e=>__vis(e)&&e.textContent.trim().startsWith(t));return h?h.closest('.card'):null;};
window.__find=sel=>{if(sel.startsWith('card:'))return __card(sel.slice(5));
 if(sel.startsWith('a4sub:'))return document.querySelectorAll('#a4Page .a4-sub')[+sel.slice(6)]||null;
 if(sel.startsWith('up:')){const [a,b]=sel.slice(3).split('|');const e=document.querySelector(a);return e?e.closest(b):null;}
 for(const s of sel.split(',')){const e=[...document.querySelectorAll(s)].find(__vis);if(e)return e;}return null;};
window.__tab=t=>switchTab(t,document.getElementById('tab-btn-'+t));
window.__set=(id,v)=>{document.getElementById(id).value=v;};
window.__proj=()=>{__set('projName','만민 건축사 사옥 신축공사');__set('projAuthor','김만민');__set('projDate','2026-10-13');};
window.__run=(id,N)=>{resetAll();__tab('calc');__proj();selectBtype(id);__set('persons',N);__set('hotTemp',60);__set('coldTemp',10);__set('useTemp',42);__set('efficiency',90);__set('safetyFactor',20);const si=Element.prototype.scrollIntoView;Element.prototype.scrollIntoView=function(){};doCalc();setTimeout(()=>{Element.prototype.scrollIntoView=si;},400);window.scrollTo(0,0);};
window.__A=()=>__run('apartment',300);
window.__B=()=>__run('office',100);
window.__ex=()=>{const R=window._calcResult;return {bt:R.btype.id,btNm:R.btype.nm,unit:R.btype.unit,N:R.N,q:R.q,T:R.T,Thot:R.Thot,Tcold:R.Tcold,Tuse:R.Tuse,effPct:R.effPct,sfPct:R.sfPct,Kh:R.Kh,
  Q_day_60:R.Q_day_60,Q_day_use:R.Q_day_use,convFactor:R.convFactor,Q_h:R.Q_h,Q_min:R.Q_min,H_kcal:R.H_kcal,H_kW_base:R.H_kW_base,H_kW:R.H_kW,H_Mcal:R.H_Mcal,
  sum:[...document.querySelectorAll('.sum-bar .sum-item')].map(e=>e.textContent.trim())};};
window.__tables=()=>({btypes:BUILDING_TYPES});`;
const SHOTS=[
 {id:'s01_overview',pre:"__A()",clip:'viewport',m:[['.tab-bar-inner','작업 탭'],['.sum-bar','요약 스트립'],['#tab-calc .step-bar','진행 단계'],['card:프로젝트 정보','프로젝트 정보'],['card:STEP 1','STEP 1 건물 용도'],['card:STEP 2','STEP 2 사용인원'],['card:STEP 3','STEP 3 온도 조건'],['card:산정 입력 요약','산정 결과'],['.fab-wrap','초기화 · 사용 안내']]},
 {id:'s02_tabs',clip:'.hdr-shell',m:[['#tab-btn-calc','급탕량 · 출력 산정'],['#tab-btn-ref','기준값 참조표'],['#tab-btn-formula','산정 공식'],['#tab-btn-a4','A4 미리보기'],['.tb-manual','매뉴얼'],['.hdr-right','근거 기준']]},
 {id:'s03_project',clip:'card:프로젝트 정보',m:[['#projName','공사명'],['#projAuthor','작성자'],['#projDate','작성일']]},
 {id:'s04_btype',clip:'card:STEP 1',m:[['#btypeGrid','용도 12종(직접 입력 포함)'],['#btn_apartment','선택한 용도'],['#selectedBtype','선택 용도 · 1인 1일 급탕량']]},
 {id:'s05_persons',clip:'card:STEP 2',m:[['#persons','총 사용인원'],['#useHours','일 사용시간(용도별 자동)'],['in:STEP 2>>.nb','1일 급탕량 · 피크 안내']]},
 {id:'s06_temp',clip:'card:STEP 3',union:'.col-input .reset-btn',m:[['#hotTemp','급탕 온도'],['#coldTemp','급수 온도'],['#useTemp','사용 온도'],['in:STEP 3>>.nb','기준 규정'],['#efficiency','보일러 효율'],['#safetyFactor','여유율'],['.col-input .calc-btn','자동 산정'],['.col-input .reset-btn','초기화']]},
 {id:'s07_summary',clip:'card:산정 입력 요약',m:[['#r_btype','건물 용도'],['#r_perPerson','1인 1일 급탕량'],['#r_sim','시간최대계수 K_h'],['#r_temps','급탕 / 급수 / 사용온도']]},
 {id:'s08_hero',clip:'up:#r_daily|.result-hero',union:'up:#r_boilerKW|.result-hero',m:[['up:#r_daily|.result-hero','1일 최대 급탕량'],['up:#r_hourly|.result-hero','시간 최대 급탕량'],['up:#r_perMin|.result-hero','분 최대 급탕량'],['up:#r_boilerKW|.result-hero','보일러 필요 출력']]},
 {id:'s09_detail',clip:'card:상세 산정 결과',union:'.formula-box',m:[['#detailTbody','상세 산정 결과'],['#calcNote','산정 기준'],['#formulaDisplay','적용 산정식']]},
 {id:'s10_result_b',pre:"__B()",wait:700,clip:'up:#r_daily|.result-hero',union:'up:#r_boilerKW|.result-hero',post:"__A()",m:[['up:#r_daily|.result-hero','1일 1,500 L'],['up:#r_boilerKW|.result-hero','보일러 21.8 kW']]},
 {id:'s11_ref',pre:"__tab('ref');scrollTo(0,0)",wait:700,clip:'card:건물 용도별',m:[['in:건물 용도별>>.nb','MANMIN 참고값 안내'],['#refTbody','용도 · 단위 · 급탕량 · 사용시간'],['in:건물 용도별>>.nb.blue','온도 환산']]},
 {id:'s12_formula',pre:"__tab('formula');scrollTo(0,0)",wait:700,clip:'card:급탕량 및 보일러',m:[]},
 {id:'s13_modal',pre:"__tab('calc');scrollTo(0,0);openGuideModal();switchGuideTab(0);document.querySelector('#guideModal .modal-box').scrollTop=0",wait:1200,fixed:true,clip:'#guideModal .modal-box',m:[]},
 {id:'s14_modal_temp',pre:"switchGuideTab(2);document.querySelector('#guideModal .modal-box').scrollTop=0",wait:1000,fixed:true,post:"closeGuide()",clip:'#guideModal .modal-box',m:[]},
 {id:'s15_a4',pre:"__A();__tab('a4');scrollTo(0,0)",wait:1500,clip:'viewport',m:[['.btn-print','인쇄 / PDF'],['.btn-jpg-a4','JPG 저장'],['#a4Page','A4 산정서']]},
 {id:'s16_a4page',clip:'#a4Page',m:[['a4sub:0','1. 설계 개요'],['a4sub:1','2. 주요 산정 결과'],['a4sub:2','3. 상세 산정 계산서'],['a4sub:3','4. 설계 기준 적합성 검토']]},
];
(async()=>{
 const s=await server(repo,PORT);const b=await chromium.launch();
 const ctx=await b.newContext({viewport:{width:VW,height:VH},deviceScaleFactor:DSF,serviceWorkers:'block'});await setup(ctx);
 const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
 await pg.addInitScript(FREEZE);
 await pg.goto(`http://127.0.0.1:${PORT}/index.html`);await pg.evaluate(()=>document.fonts.ready);await pg.waitForTimeout(2500);
 await pg.addStyleTag({content:HIDE});
 await pg.evaluate(HELP);
 const ex={};const meta={};
 for(const S of SHOTS){
  if(S.pre){try{await pg.evaluate(S.pre);}catch(e){errs.push(S.id+' pre '+e.message);}}
  await pg.waitForTimeout(S.wait||600);
  if(S.id==='s01_overview'){ex.A=await pg.evaluate('__ex()');ex.tables=await pg.evaluate('__tables()');}
  if(S.id==='s10_result_b')ex.B=await pg.evaluate('__ex()');
  if(S.id==='s16_a4page')ex.A_a4=await pg.evaluate(()=>document.getElementById('a4Page').innerText.replace(/\s+/g,' '));
  const info=await pg.evaluate(({S,VW,VH})=>{
   const abs=e=>{const r=e.getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY,w:r.width,h:r.height};};
   const F=sel=>{if(sel.startsWith('in:')){const [t,q]=sel.slice(3).split('>>');const c=__card(t);return c?c.querySelector(q):null;}return __find(sel);};
   let clip;
   if(S.clip==='viewport'){clip={x:0,y:scrollY,width:VW,height:VH};}
   else{const el=__find(S.clip);if(!el)return {err:'clip '+S.clip};const a=abs(el);clip={x:a.x,y:a.y,width:a.w,height:a.h};
     if(S.union){const e2=__find(S.union);if(e2){const a2=abs(e2);const x0=Math.min(clip.x,a2.x),y0=Math.min(clip.y,a2.y),x1=Math.max(clip.x+clip.width,a2.x+a2.w),y1=Math.max(clip.y+clip.height,a2.y+a2.h);clip={x:x0,y:y0,width:x1-x0,height:y1-y0};}}
     const P=12;clip={x:Math.max(0,clip.x-P),y:Math.max(0,clip.y-P),width:clip.width+2*P,height:clip.height+2*P};}
   const marks=[];(S.m||[]).forEach(([sel,label],i)=>{const e=F(sel);if(!e){marks.push({n:i+1,label,miss:sel});return;}const a=abs(e);
     marks.push({n:i+1,label,x:+((a.x-clip.x)/clip.width*100).toFixed(2),y:+((a.y-clip.y)/clip.height*100).toFixed(2),w:+(Math.min(a.w,clip.x+clip.width-a.x)/clip.width*100).toFixed(2),h:+(Math.min(a.h,clip.y+clip.height-a.y)/clip.height*100).toFixed(2)});});
   return {clip,marks};},{S,VW,VH});
  if(info.err){errs.push(S.id+' '+info.err);continue;}
  const c=info.clip;const cl={x:Math.max(0,c.x),y:Math.max(0,c.y),width:Math.min(c.width,VW-Math.max(0,c.x)),height:c.height};
  if(S.clip==='viewport'){await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:0,y:0,width:VW,height:VH}});}
  else if(S.fixed){const sx=await pg.evaluate(()=>scrollX),sy=await pg.evaluate(()=>scrollY);await pg.screenshot({path:path.join(out,S.id+'.png'),clip:{x:c.x-sx,y:c.y-sy,width:Math.min(c.width,VW),height:Math.min(c.height,VH)}});}
  else{await pg.screenshot({path:path.join(out,S.id+'.png'),clip:cl,fullPage:true});}
  meta[S.id]={w:Math.round(cl.width),h:Math.round(Math.min(cl.height,S.fixed?VH:1e9)),marks:info.marks};
  if(S.post){try{await pg.evaluate(S.post);}catch(e){errs.push(S.id+' post '+e.message);}await pg.waitForTimeout(400);}
 }
 await pg.evaluate('__A()');await pg.waitForTimeout(500);ex.after=await pg.evaluate('__ex()');
 const mctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,serviceWorkers:'block',isMobile:true,hasTouch:true});await setup(mctx);
 const mp=await mctx.newPage();await mp.addInitScript(FREEZE);
 await mp.goto(`http://127.0.0.1:${PORT}/index.html`);await mp.waitForTimeout(2500);
 await mp.addStyleTag({content:HIDE});await mp.evaluate(HELP);await mp.evaluate('__A()');await mp.waitForTimeout(600);
 await mp.screenshot({path:path.join(out,'s17_mobile_main.png')});meta['s17_mobile_main']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{document.getElementById('resultPanel').scrollIntoView({block:'start'});window.scrollBy(0,-70);});await mp.waitForTimeout(500);
 await mp.screenshot({path:path.join(out,'s18_mobile_result.png')});meta['s18_mobile_result']={w:390,h:844,marks:[]};
 await mp.evaluate(()=>{__tab('a4');window.scrollTo(0,0);});await mp.waitForTimeout(1200);
 await mp.screenshot({path:path.join(out,'s19_mobile_a4.png')});meta['s19_mobile_a4']={w:390,h:844,marks:[]};
 ex.mobile=await mp.evaluate(()=>({page:document.documentElement.scrollWidth,tabbar:document.querySelector('.tab-bar-inner').scrollWidth,vw:innerWidth,manualVisible:(()=>{const r=document.querySelector('.tb-manual').getBoundingClientRect();return r.right<=innerWidth&&r.width>0;})()}));
 fs.writeFileSync(path.join(out,'_marks.json'),JSON.stringify(meta,null,1));fs.writeFileSync(path.join(out,'_example.json'),JSON.stringify(ex,null,1));
 const miss=[];Object.entries(meta).forEach(([k,v])=>v.marks.forEach(m=>{if(m.miss)miss.push(k+':'+m.miss);else if(m.x<0||m.y<0||m.x+m.w>100.5||m.y+m.h>100.5||m.w<=0||m.h<=0)miss.push(k+':OUT '+m.label+' '+m.x+','+m.y+','+m.w+','+m.h);}));
 const pick=e=>e&&[e.Q_day_60,e.Q_h,+e.H_kW.toFixed(2)];
 console.log(JSON.stringify({A:pick(ex.A),B:pick(ex.B),same:JSON.stringify({...ex.A,sum:0})===JSON.stringify({...ex.after,sum:0}),mobile:ex.mobile,sizes:Object.fromEntries(Object.entries(meta).map(([k,v])=>[k,v.w+'x'+v.h])),miss,errs:errs.slice(0,15)},null,1));
 await b.close();s.close();
})();
