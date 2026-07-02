
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const uid = () => Math.random().toString(36).slice(2, 9);

/* ---------- block defaults ---------- */
const DEFAULTS = {
  heading:{content:'Your Heading Here',style:{fontSize:28,color:'#111111',bg:'',align:'left',py:16,px:40,weight:'700'}},
  text:{content:'Write your message here. Click to edit this text and tell your story.',style:{fontSize:16,color:'#333333',bg:'',align:'left',py:12,px:40}},
  button:{content:'Click Here',href:'https://example.com',style:{fontSize:15,color:'#ffffff',bg:'#2563eb',align:'center',py:20,px:40,radius:6,width:220}},
  divider:{style:{color:'#e5e7eb',py:12,px:40}},
  spacer:{style:{height:32}},
  image:{src:'https://placehold.co/520x240?text=Add+your+image+URL',alt:'Image',href:'',style:{align:'center',py:12,px:40,width:520}},
  video:{src:'https://placehold.co/520x290?text=Add+your+video+thumbnail+URL',alt:'Watch',href:'https://youtube.com',style:{align:'center',py:20,px:40,width:520}},
  // social:{socials:['facebook','twitter','instagram','linkedin'],style:{align:'center',py:16,px:40}},
  columns2:{cols:[[],[]],style:{py:8,px:0}},
  columns3:{cols:[[],[],[]],style:{py:8,px:0}},
  hero:{content:'Big Bold Headline',src:'',href:'',style:{fontSize:32,color:'#ffffff',bg:'#2563eb',align:'center',py:48,px:40,weight:'700'}},
  header:{content:'COMPANY',style:{fontSize:22,color:'#ffffff',bg:'#111827',align:'center',py:24,px:40,weight:'700'}},
  footer:{content:'© 2026 Your Company. All rights reserved.<br/>123 Street, City.<br/><a href="#">Unsubscribe</a>',style:{fontSize:12,color:'#6b7280',bg:'#f3f4f6',align:'center',py:24,px:40}},
  raw:{content:'',style:{}},
};
// const SOCIAL_ICON={facebook:'https://cdn-icons-png.flaticon.com/32/733/733547.png',twitter:'https://cdn-icons-png.flaticon.com/32/733/733579.png',instagram:'https://cdn-icons-png.flaticon.com/32/2111/2111463.png',linkedin:'https://cdn-icons-png.flaticon.com/32/145/145807.png'};
// const SOCIAL_EMOJI={facebook:'📘',twitter:'🐦',instagram:'📷',linkedin:'💼'};

function makeBlock(type){return {id:uid(),type,...structuredClone(DEFAULTS[type]||{style:{}})};}

/* ---------- state + history ---------- */
let doc={name:'Untitled Email',bg:'#f4f4f7',width:600,blocks:[]};
let selected=null, past=[], future=[];
function snapshot(){past.push(structuredClone(doc));if(past.length>50)past.shift();future=[];}
function undo(){if(!past.length)return;future.push(structuredClone(doc));doc=past.pop();selected=null;renderAll();}
function redo(){if(!future.length)return;past.push(structuredClone(doc));doc=future.pop();renderAll();}
function findBlk(id,list=doc.blocks){for(const b of list){if(b.id===id)return b;if(b.cols)for(const c of b.cols){const f=findBlk(id,c);if(f)return f;}}return null;}

/* ---------- palette ---------- */
const PAL_CONTENT=[['text','📝','Text'],['heading','🔤','Heading'],['button','🔘','Button'],['divider','➖','Divider'],['spacer','↕','Spacer'],['image','🖼','Image'],['video','▶','Video']/*['social','🔗','Social']*/];
const PAL_LAYOUT=[['hero','🎯','Hero'],['header','⬆','Header'],['footer','⬇','Footer']];
function buildPalette(el,items){el.innerHTML=items.map(([t,i,l])=>`<div class="pal-item" draggable="true" data-type="${t}"><span class="ico">${i}</span>${l}</div>`).join('');}
buildPalette(palContent,PAL_CONTENT);buildPalette(palLayout,PAL_LAYOUT);

/* ---------- canvas render (editor view) ---------- */
function pad(s){return `${s.py||0}px ${s.px||0}px`;}
function editAttr(id){return `data-edit="${id}"`;}
function renderEditorBlock(b){
  const s=b.style||{};
  let inner='';
  switch(b.type){
    case 'heading': case 'text':
      inner=`<div ${editAttr(b.id)} contenteditable style="padding:${pad(s)};font-size:${s.fontSize}px;color:${s.color};font-weight:${s.weight||400};text-align:${s.align};line-height:1.5">${b.content}</div>`;break;
    case 'button':
      inner=`<div style="text-align:${s.align};padding:${pad(s)}"><span ${editAttr(b.id)} contenteditable style="display:inline-block;background:${s.bg};color:${s.color};padding:12px 28px;border-radius:${s.radius}px;font-weight:700;font-size:${s.fontSize}px">${b.content}</span></div>`;break;
    case 'divider': inner=`<div style="padding:${pad(s)}"><hr style="border:none;border-top:1px solid ${s.color}"></div>`;break;
    case 'spacer': inner=`<div style="height:${s.height}px;background:repeating-linear-gradient(45deg,transparent,transparent 6px,#eee 6px,#eee 12px)"></div>`;break;
    case 'image': case 'video':
      inner=`<div style="text-align:${s.align};padding:${pad(s)}"><img src="${b.src}" style="max-width:100%;width:${s.width}px">${b.type==='video'?'<div style="margin-top:-46px;font-size:40px;position:absolute;top:60%;left:50%;transform:translate(-50%,-50%)">▶️</div>':''}</div>`;break;
    // case 'social':
    //   inner=`<div style="text-align:${s.align};padding:${pad(s)};font-size:24px">${(b.socials||[]).map(n=>`<span style="margin:0 6px">${SOCIAL_EMOJI[n]||'🔗'}</span>`).join('')}</div>`;break;
    case 'hero':
      inner=`<div ${editAttr(b.id)} contenteditable style="background:${s.bg} ${b.src?`url(${b.src})`:''} center/cover;color:${s.color};text-align:${s.align};padding:${pad(s)};font-size:${s.fontSize}px;font-weight:${s.weight}">${b.content}</div>`;break;
    case 'header': case 'footer':
      inner=`<div ${editAttr(b.id)} contenteditable style="background:${s.bg};color:${s.color};text-align:${s.align};padding:${pad(s)};font-size:${s.fontSize}px;font-weight:${s.weight||400};line-height:1.6">${b.content}</div>`;break;
    case 'columns2': case 'columns3':
      inner=`<div style="display:flex;gap:10px;padding:${s.py}px 14px">${b.cols.map((c,i)=>`<div style="flex:1;min-height:46px;border:1px dashed #cbd5e1;border-radius:6px;padding:6px" data-col="${b.id}:${i}">${c.length?c.map(renderEditorBlock).join(''):`<div style="text-align:center;color:#aaa;font-size:11px;padding:8px">Col ${i+1}</div>`}</div>`).join('')}</div>`;break;
    case 'raw':{
      // Imported HTML is rendered inside a sandboxed iframe so its styles are
      // isolated from the builder UI and its appearance is shown exactly as-is.
      const safe=(b.content||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');
      inner=`<iframe sandbox="allow-same-origin" srcdoc="${safe}" style="width:100%;border:0;display:block;background:#fff;pointer-events:none" onload="try{this.style.height=this.contentWindow.document.documentElement.scrollHeight+'px'}catch(e){this.style.height='400px'}"></iframe>`;break;
    }
  }
  const tools=`<div class="tools"><button data-act="dup" data-id="${b.id}">⧉</button><button data-act="del" data-id="${b.id}">🗑</button></div>`;
  return `<div class="blk ${selected===b.id?'sel':''}" data-id="${b.id}" draggable="true">${tools}${inner}</div>`;
}
function renderCanvas(){
  canvas.style.width=doc.width+'px';
  canvas.innerHTML=doc.blocks.length?doc.blocks.map(renderEditorBlock).join(''):'<div class="empty"><b>Your email is empty</b><br><small>Drag a block here or pick a template.</small></div>';
}

/* ---------- inspector ---------- */
function inspField(label,html){return `<label class="field"><span>${label}</span>${html}</label>`;}
function renderInspector(){
  const b=selected?findBlk(selected):null;
  if(!b){
    inspector.innerHTML=`<div class="sec-title">Email Settings</div>
      ${inspField('Background',`<input type="color" data-doc="bg" value="${doc.bg}">`)}
      ${inspField('Content width (px)',`<input type="number" data-doc="width" value="${doc.width}">`)}
      <p style="color:var(--mut);font-size:12px;margin-top:14px">Select a block to edit it.</p>`;return;
  }
  const s=b.style||{};
  if(b.type==='raw'){
    inspector.innerHTML=`<div class="sec-title">imported HTML</div>`
      +inspField('HTML (CSS already inlined — edit directly)',`<textarea data-f="content" style="height:300px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px">${(b.content||'').replace(/</g,'&lt;')}</textarea>`)
      +`<p style="color:var(--mut);font-size:12px;margin-top:10px">This block keeps your uploaded layout and styling untouched. Its CSS has been inlined for email clients.</p>`;
    return;
  }
  const hasText=['heading','text','button','hero','header','footer'].includes(b.type);
  const hasImg=['image','video','hero'].includes(b.type);
  let h=`<div class="sec-title">${b.type} block</div>`;
  if(hasText)h+=inspField('Content (HTML ok)',`<textarea data-f="content">${(b.content||'').replace(/</g,'&lt;')}</textarea>`);
  if(['button','image','video','hero'].includes(b.type))h+=inspField('Link URL',`<input data-f="href" value="${b.href||''}">`);
  if(hasImg)h+=inspField('Image URL',`<input data-f="src" value="${b.src||''}">`)+inspField('Alt text',`<input data-f="alt" value="${b.alt||''}">`);
  if(b.type!=='spacer')h+=`<div class="row2">${inspField('Text color',`<input type="color" data-s="color" value="${s.color||'#000000'}">`)}${inspField('Background',`<input type="color" data-s="bg" value="${s.bg||'#ffffff'}">`)}</div>`;
  if(hasText)h+=`<div class="row2">${inspField('Font size',`<input type="number" data-s="fontSize" value="${s.fontSize||16}">`)}${inspField('Align',`<select data-s="align"><option ${s.align=='left'?'selected':''}>left</option><option ${s.align=='center'?'selected':''}>center</option><option ${s.align=='right'?'selected':''}>right</option></select>`)}</div>`;
  if(b.type==='spacer')h+=inspField('Height (px)',`<input type="number" data-s="height" value="${s.height||32}">`);
  if(b.type!=='spacer')h+=`<div class="row2">${inspField('Padding Y',`<input type="number" data-s="py" value="${s.py||0}">`)}${inspField('Padding X',`<input type="number" data-s="px" value="${s.px||0}">`)}</div>`;
  if(b.type==='button')h+=`<div class="row2">${inspField('Width',`<input type="number" data-s="width" value="${s.width||220}">`)}${inspField('Radius',`<input type="number" data-s="radius" value="${s.radius||6}">`)}</div>`;
  if(b.type==='image'||b.type==='video')h+=inspField('Width',`<input type="number" data-s="width" value="${s.width||520}">`);
  inspector.innerHTML=h;
}

/* ---------- EMAIL HTML EXPORT (table-based, 100% INLINE CSS, VML, fluid-responsive) ---------- */
/* Inline reset applied to every table/td/img so no <style> block is needed.
   Responsiveness is achieved with fluid widths (width:100%;max-width) + the
   hybrid/"spongy" inline-block column technique — both work without media queries. */
const TBL="border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt";
const IMGRESET="border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;display:block";
function bb(b){ // bulletproof button
  const s=b.style;
  return `<tr><td align="${s.align}" style="padding:${pad(s)}">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:auto;${TBL}"><tr><td align="center" bgcolor="${s.bg}" style="border-radius:${s.radius}px">
  <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${b.href||'#'}" style="height:44px;v-text-anchor:middle;width:${s.width}px" arcsize="${Math.round(s.radius/44*100)}%" fillcolor="${s.bg}" strokecolor="${s.bg}"><center style="color:${s.color};font-family:${FONT};font-size:${s.fontSize}px;font-weight:bold">${b.content}</center></v:roundrect><![endif]-->
  <!--[if !mso]><!--><a href="${b.href||'#'}" style="display:inline-block;background:${s.bg};color:${s.color};font-family:${FONT};font-size:${s.fontSize}px;font-weight:bold;line-height:44px;text-align:center;text-decoration:none;width:${s.width}px;border-radius:${s.radius}px">${b.content}</a><!--<![endif]-->
  </td></tr></table></td></tr>`;
}
function emailRow(b){
  const s=b.style||{};
  switch(b.type){
    case 'heading': case 'text':
      return `<tr><td style="padding:${pad(s)};font-family:${FONT};font-size:${s.fontSize}px;color:${s.color};font-weight:${s.weight||400};text-align:${s.align};line-height:1.5;word-break:break-word">${b.content}</td></tr>`;
    case 'button': return bb(b);
    case 'raw': return `<tr><td style="padding:0">${b.content}</td></tr>`;
    case 'divider': return `<tr><td style="padding:${pad(s)}"><table width="100%" role="presentation" cellpadding="0" cellspacing="0" style="${TBL}"><tr><td style="border-top:1px solid ${s.color};font-size:0;line-height:0">&nbsp;</td></tr></table></td></tr>`;
    case 'spacer': return `<tr><td style="height:${s.height}px;line-height:${s.height}px;font-size:0">&nbsp;</td></tr>`;
    case 'image': {const im=`<img src="${b.src}" alt="${b.alt||''}" width="${s.width}" style="width:100%;max-width:${s.width}px;height:auto;margin:0 auto;${IMGRESET}">`;return `<tr><td align="${s.align}" style="padding:${pad(s)}">${b.href?`<a href="${b.href}" style="text-decoration:none">${im}</a>`:im}</td></tr>`;}
    case 'video': return `<tr><td align="${s.align}" style="padding:${pad(s)}"><a href="${b.href}" style="text-decoration:none"><img src="${b.src}" alt="${b.alt||''}" width="${s.width}" style="width:100%;max-width:${s.width}px;height:auto;margin:0 auto;${IMGRESET}"></a></td></tr>`;
    case 'social': return `<tr><td align="${s.align}" style="padding:${pad(s)}">${(b.socials||[]).map(n=>`<a href="#" style="display:inline-block;margin:0 5px;text-decoration:none"><img src="${SOCIAL_ICON[n]||''}" width="32" height="32" alt="${n}" style="${IMGRESET};display:inline-block"></a>`).join('')}</td></tr>`;
    case 'hero': return `<tr><td align="${s.align}" bgcolor="${s.bg}" background="${b.src||''}" style="padding:${pad(s)};background-color:${s.bg};background-image:${b.src?`url('${b.src}')`:'none'};background-position:center;background-size:cover;background-repeat:no-repeat"><div style="font-family:${FONT};font-size:${s.fontSize}px;font-weight:${s.weight};color:${s.color}">${b.content}</div></td></tr>`;
    case 'header': return `<tr><td align="${s.align}" bgcolor="${s.bg}" style="padding:${pad(s)};background-color:${s.bg};font-family:${FONT};font-size:${s.fontSize}px;font-weight:${s.weight};color:${s.color}">${b.content}</td></tr>`;
    case 'footer': return `<tr><td align="${s.align}" bgcolor="${s.bg}" style="padding:${pad(s)};background-color:${s.bg};font-family:${FONT};font-size:${s.fontSize}px;color:${s.color};line-height:1.6">${b.content}</td></tr>`;
    case 'columns2': case 'columns3':{
      // Hybrid/"spongy" columns: inline-block divs with width:100%+max-width stack
      // automatically on narrow screens — fully responsive without any media query.
      const n=b.cols.length;
      const colMax=Math.floor(doc.width/n)-12;
      return `<tr><td style="padding:${s.py||0}px 6px;font-size:0;text-align:center">`
        +`<!--[if mso]><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${TBL}"><tr><![endif]-->`
        +b.cols.map(c=>`<!--[if mso]><td width="${colMax}" valign="top"><![endif]-->`
          +`<div style="display:inline-block;vertical-align:top;width:100%;max-width:${colMax}px;margin:0 4px;text-align:left">`
          +`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="${TBL}">${c.map(emailRow).join('')}</table>`
          +`</div><!--[if mso]></td><![endif]-->`).join('')
        +`<!--[if mso]></tr></table><![endif]--></td></tr>`;}
  }
  return '';
}
function exportEmail(){
  const rows=doc.blocks.map(emailRow).join('\n');
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "https://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="https://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge">
<meta name="color-scheme" content="light dark"><meta name="supported-color-schemes" content="light dark">
<title>${doc.name}</title>
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;width:100%;background-color:${doc.bg};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%">
<center style="width:100%;background-color:${doc.bg}">
<!--[if mso|IE]><table role="presentation" width="${doc.width}" align="center" cellpadding="0" cellspacing="0" style="border-collapse:collapse"><tr><td><![endif]-->
<table role="presentation" align="center" cellpadding="0" cellspacing="0" width="100%" style="margin:0 auto;max-width:${doc.width}px;width:100%;background-color:#ffffff;border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt">
${rows}
</table>
<!--[if mso|IE]></td></tr></table><![endif]-->
</center></body></html>`;
}

/* ---------- render all ---------- */
function renderAll(){renderCanvas();renderInspector();docName.value=doc.name;updateLive();undoBtn.disabled=!past.length;redoBtn.disabled=!future.length;}
function updateLive(){const html=exportEmail();codeArea.value=html;codePreview.srcdoc=html;bigPreview.srcdoc=html;}

/* ---------- interactions ---------- */
function addBlock(type,index){
  snapshot();
  const b=makeBlock(type);
  if(type==='image'||type==='video'){
    const url=prompt('Paste the '+(type==='video'?'video thumbnail':'image')+' URL (hosted on your server):','');
    if(url&&url.trim())b.src=url.trim();
  }
  if(index==null||index>doc.blocks.length)doc.blocks.push(b);else doc.blocks.splice(index,0,b);
  selected=b.id;renderAll();
}
// palette: click to add + drag
document.querySelectorAll('.pal-item').forEach(el=>{
  el.addEventListener('click',()=>addBlock(el.dataset.type));
  el.addEventListener('dragstart',e=>e.dataTransfer.setData('newtype',el.dataset.type));
});
// canvas drop
canvas.addEventListener('dragover',e=>e.preventDefault());
canvas.addEventListener('drop',e=>{
  e.preventDefault();
  const nt=e.dataTransfer.getData('newtype');
  const tgt=e.target.closest('.blk');const idx=tgt?doc.blocks.findIndex(b=>b.id===tgt.dataset.id):doc.blocks.length;
  if(nt){addBlock(nt,idx<0?doc.blocks.length:idx);return;}
  const drag=e.dataTransfer.getData('blockid');
  if(drag){const from=doc.blocks.findIndex(b=>b.id===drag);if(from<0)return;snapshot();const[m]=doc.blocks.splice(from,1);const to=tgt?doc.blocks.findIndex(b=>b.id===tgt.dataset.id):doc.blocks.length;doc.blocks.splice(to<0?doc.blocks.length:to,0,m);renderAll();}
});
// select / tools / drag start / inline edit
canvas.addEventListener('mousedown',e=>{const blk=e.target.closest('.blk');if(blk&&!e.target.closest('.tools')){selected=blk.dataset.id;renderInspector();canvas.querySelectorAll('.blk').forEach(x=>x.classList.toggle('sel',x.dataset.id===selected));}});
canvas.addEventListener('dragstart',e=>{const blk=e.target.closest('.blk');if(blk)e.dataTransfer.setData('blockid',blk.dataset.id);});
canvas.addEventListener('click',e=>{const btn=e.target.closest('button[data-act]');if(!btn)return;const id=btn.dataset.id,i=doc.blocks.findIndex(b=>b.id===id);if(i<0)return;snapshot();if(btn.dataset.act==='del'){doc.blocks.splice(i,1);selected=null;}else{const c=structuredClone(doc.blocks[i]);c.id=uid();doc.blocks.splice(i+1,0,c);}renderAll();});
canvas.addEventListener('blur',e=>{const ed=e.target.closest('[data-edit]');if(ed){const b=findBlk(ed.dataset.edit);if(b){b.content=ed.innerHTML;updateLive();}}},true);
// inspector inputs
inspector.addEventListener('input',e=>{
  const t=e.target;const b=selected?findBlk(selected):null;
  if(t.dataset.doc){doc[t.dataset.doc]=t.type==='number'?+t.value:t.value;renderAll();return;}
  if(!b)return;
  if(t.dataset.f)b[t.dataset.f]=t.value;
  if(t.dataset.s)b.style[t.dataset.s]=t.type==='number'?+t.value:t.value;
  renderCanvas();updateLive();canvas.querySelectorAll('.blk').forEach(x=>x.classList.toggle('sel',x.dataset.id===selected));
});
docName.addEventListener('input',()=>{doc.name=docName.value;updateLive();});
undoBtn.onclick=undo;redoBtn.onclick=redo;
function resetDoc(){
  if(!confirm('Reset and start a new email? This clears the current canvas.'))return;
  snapshot(); // keep the previous state recoverable via Undo
  doc={name:'Untitled Email',bg:'#f4f4f7',width:600,blocks:[]};
  selected=null;
  try{localStorage.removeItem('eb-doc');}catch(e){}
  renderAll();toastMsg('Started a new email');
}
newBtn.onclick=resetDoc;
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();e.shiftKey?redo():undo();}});

/* ---------- tabs ---------- */
document.querySelectorAll('.tab').forEach(t=>t.onclick=()=>{
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));t.classList.add('active');
  const v=t.dataset.tab;buildView.style.display=v==='build'?'flex':'none';codeView.style.display=v==='code'?'flex':'none';previewView.style.display=v==='preview'?'flex':'none';
  leftPanel.style.display=v==='build'?'block':'none';inspector.style.display=v==='build'?'block':'none';updateLive();
});
document.querySelectorAll('.seg').forEach(s=>s.onclick=()=>{document.querySelectorAll('.seg').forEach(x=>x.classList.remove('active'));s.classList.add('active');pframe.style.width=s.dataset.w+'px';});
copyCode.onclick=()=>{navigator.clipboard.writeText(codeArea.value);toastMsg('HTML copied');};

/* ---------- templates ---------- */
const TPL=[
 ['Newsletter','Sections + footer',()=>[t('header',{content:'THE WEEKLY'}),t('heading',{content:'This Week in Tech'}),t('text',{}),t('image',{}),t('button',{content:'Read More'}),t('divider',{}),t('social',{}),t('footer',{})]],
 ['Admission Campaign','Hero + CTA',()=>[t('hero',{content:'Admissions Open 2026'}),t('heading',{content:'Shape Your Future'}),t('text',{}),t('button',{content:'Apply Now'}),t('footer',{})]],
 ['Lead Generation','Value + download',()=>[t('header',{content:'GROWTH CO'}),t('heading',{content:'Get Our Free Guide'}),t('text',{}),t('image',{}),t('button',{content:'Download',style:{bg:'#16a34a'}}),t('footer',{})]],
 ['Event Invitation','Date + RSVP',()=>[t('hero',{content:"You're Invited!",style:{bg:'#7c3aed'}}),t('heading',{content:'Innovation Summit'}),t('text',{content:'📅 Sept 12 · 🕙 10AM · 📍 Convention Center',style:{align:'center'}}),t('button',{content:'RSVP Now',style:{bg:'#7c3aed'}}),t('footer',{})]],
 ['Product Launch','Image + shop',()=>[t('header',{content:'ACME'}),t('image',{src:'https://placehold.co/600x300?text=New+Product'}),t('heading',{content:'Introducing Acme Pro',style:{align:'center'}}),t('text',{style:{align:'center'}}),t('button',{content:'Shop Now'}),t('footer',{})]],
 ['Promotional Offer','Sale + urgency',()=>[t('hero',{content:'🔥 50% OFF',style:{bg:'#dc2626'}}),t('text',{content:'48 hours only — our biggest sale of the year.',style:{align:'center'}}),t('button',{content:'Shop the Sale',style:{bg:'#dc2626'}}),t('footer',{})]],
 ['Welcome Email','Onboarding',()=>[t('header',{content:'WELCOME'}),t('heading',{content:'Welcome aboard! 🎉',style:{align:'center'}}),t('text',{}),t('button',{content:'Get Started'}),t('footer',{})]],
 ['Follow-Up','Re-engage',()=>[t('heading',{content:'Just checking in 👋'}),t('text',{content:'Hi {{name}}, following up on my last note.'}),t('button',{content:'Book a Time',style:{width:200}}),t('text',{content:'Best,<br>The Team',style:{fontSize:14}}),t('footer',{})]],
];
function t(type,over){const b=makeBlock(type);if(over.content!=null)b.content=over.content;if(over.src)b.src=over.src;if(over.style)Object.assign(b.style,over.style);return b;}
tplList.innerHTML=TPL.map((x,i)=>`<button class="tpl" data-i="${i}"><b>${x[0]}</b><small>${x[1]}</small></button>`).join('');
tplList.querySelectorAll('.tpl').forEach(el=>el.onclick=()=>{snapshot();doc.blocks=TPL[el.dataset.i][2]();selected=null;renderAll();toastMsg('Template loaded');});

/* ---------- upload + convert ---------- */
uploadBtn.onclick=()=>modal.classList.add('show');
closeModal.onclick=()=>modal.classList.remove('show');
dropZone.onclick=()=>fileInput.click();
dropZone.ondragover=e=>e.preventDefault();
dropZone.ondrop=e=>{e.preventDefault();if(e.dataTransfer.files[0])handleFile(e.dataTransfer.files[0]);};
fileInput.onchange=e=>{if(e.target.files[0])handleFile(e.target.files[0]);};
convAnother.onclick=()=>{analysis.style.display='none';dropZone.style.display='block';};
let convertedHtml='', rawHtml='', uploadKind='docx';
async function handleFile(file){
  dropText.textContent='Converting…';
  try{
    let html='';
    if(file.name.endsWith('.docx')){const buf=await file.arrayBuffer();const r=await mammoth.convertToHtml({arrayBuffer:buf});html=r.value;uploadKind='docx';}
    else{html=await file.text();uploadKind='html';rawHtml=html;}
    convertedHtml=cleanImported(html);
    showAnalysis(convertedHtml);
  }catch(err){dropText.textContent='Conversion failed: '+err.message;}
}
function cleanImported(html){const d=document.createElement('div');d.innerHTML=html;d.querySelectorAll('script,style,link,iframe,object').forEach(n=>n.remove());d.querySelectorAll('*').forEach(n=>{[...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||(a.name==='href'&&/javascript:/i.test(a.value)))n.removeAttribute(a.name);});});return d.innerHTML;}

/* ---------- CSS inliner for uploaded HTML (preserves layout, makes CSS inline) ---------- */
function specificity(sel){
  const id=(sel.match(/#[\w-]+/g)||[]).length;
  const cls=(sel.match(/\.[\w-]+|\[[^\]]+\]|:[\w-]+/g)||[]).length;
  const elx=(sel.replace(/[#.\[][^\s>+~]*/g,' ').match(/[a-z][\w-]*/gi)||[]).length;
  return id*1000+cls*100+elx;
}
function inlineCss(html){
  const dp=new DOMParser().parseFromString(html,'text/html');
  const styleEls=[...dp.querySelectorAll('style')];
  const rules=[]; const residual=[]; let order=0;
  const NONINLINE=/::|:(hover|focus|active|visited|link|checked|target|focus-within|focus-visible|before|after|first-line|first-letter|placeholder)/i;
  styleEls.forEach(se=>{
    const tmp=document.createElement('style');
    tmp.setAttribute('media','not all'); // parse only, never apply to the builder page
    tmp.textContent=se.textContent;
    document.head.appendChild(tmp);
    try{
      [...(tmp.sheet.cssRules||[])].forEach(rule=>{
        if(rule.type===1){ // CSSStyleRule
          rule.selectorText.split(',').forEach(sel=>{
            sel=sel.trim(); if(!sel)return;
            if(NONINLINE.test(sel)){residual.push(sel+'{'+rule.style.cssText+'}');return;}
            rules.push({sel,style:rule.style,spec:specificity(sel),order:order++});
          });
        } else { residual.push(rule.cssText); } // @media, @font-face, @keyframes, etc.
      });
    }catch(e){}
    document.head.removeChild(tmp);
  });
  // cascade: apply matched rules (low→high), then keep any pre-existing inline style on top
  [...dp.querySelectorAll('*')].forEach(el=>{
    const matched=[];
    rules.forEach(r=>{ try{ if(el.matches(r.sel)) matched.push(r);}catch(e){} });
    if(!matched.length && !el.getAttribute('style'))return;
    matched.sort((a,b)=>a.spec-b.spec||a.order-b.order);
    const final={};
    matched.forEach(r=>{ for(let i=0;i<r.style.length;i++){const p=r.style[i];final[p]=r.style.getPropertyValue(p);} });
    const inl=el.style; for(let i=0;i<inl.length;i++){const p=inl[i];final[p]=inl.getPropertyValue(p);}
    const str=Object.keys(final).map(p=>`${p}:${final[p]}`).join(';');
    if(str)el.setAttribute('style',str);
  });
  styleEls.forEach(se=>se.remove());
  // sanitize: strip scripts and event handlers, keep inline styles
  dp.querySelectorAll('script,link,iframe,object,meta').forEach(n=>n.remove());
  dp.querySelectorAll('*').forEach(n=>[...n.attributes].forEach(a=>{if(/^on/i.test(a.name)||(a.name==='href'&&/javascript:/i.test(a.value)))n.removeAttribute(a.name);}));
  let out=dp.body.innerHTML;
  if(residual.length)out=`<style>${residual.join('\n')}</style>\n`+out; // @media/:hover can't inline — kept to preserve UI
  return out;
}
function showAnalysis(html){
  const d=document.createElement('div');d.innerHTML=html;
  const stats=[['Headings',d.querySelectorAll('h1,h2,h3,h4').length],['Paragraphs',d.querySelectorAll('p').length],['Images',d.querySelectorAll('img').length],['Tables',d.querySelectorAll('table').length],['Links',d.querySelectorAll('a').length],['Lists',d.querySelectorAll('ul,ol').length]];
  statGrid.innerHTML=stats.map(([l,n])=>`<div><b>${n}</b><br><small>${l}</small></div>`).join('');
  // per-image URL editor — works for both DOCX (often embedded/base64) and HTML
  const imgs=[...d.querySelectorAll('img')];
  if(imgs.length){
    imgFix.innerHTML=`<div class="sec-title" style="margin:4px 0 8px">Images — add / replace hosted URL (${imgs.length})</div>`
      +imgs.map((im,i)=>{
        const cur=im.getAttribute('src')||'';
        const isData=/^data:/i.test(cur);
        const thumb=cur?`<img src="${cur}" style="width:38px;height:38px;object-fit:cover;border-radius:5px;border:1px solid var(--bd);flex:none">`:`<div style="width:38px;height:38px;border-radius:5px;border:1px dashed var(--bd);flex:none"></div>`;
        const ph=isData?'Embedded image — paste your server URL':'Override image URL (optional)';
        const val=isData?'':cur.replace(/"/g,'&quot;');
        return `<div style="display:flex;gap:8px;align-items:center;margin-bottom:6px">${thumb}<input data-imgidx="${i}" placeholder="${ph}" value="${val}" style="flex:1;background:var(--panel2);border:1px solid var(--bd);border-radius:6px;color:var(--tx);padding:6px 8px;font-size:12px"></div>`;
      }).join('');
  } else { imgFix.innerHTML=''; }
  dropZone.style.display='none';analysis.style.display='block';
}
// rewrite <img> srcs from the modal inputs, before block-conversion / inlining
function applyImgUrls(srcHtml,fullDoc){
  const dp=new DOMParser().parseFromString(srcHtml,'text/html');
  const imgs=[...dp.querySelectorAll('img')];
  imgFix.querySelectorAll('[data-imgidx]').forEach(inp=>{
    const i=+inp.dataset.imgidx,v=inp.value.trim();
    if(v&&imgs[i])imgs[i].setAttribute('src',v);
  });
  return fullDoc?dp.documentElement.outerHTML:dp.body.innerHTML;
}
const CTA=['apply','register','buy','shop','get started','learn more','download','subscribe','join','rsvp','sign up','start'];
function importToBlocks(html){
  const d=document.createElement('div');d.innerHTML=html;const blocks=[];
  const walk=node=>{for(const el of node.children){const tag=el.tagName.toLowerCase();
    if(/^h[1-6]$/.test(tag)){const b=makeBlock('heading');b.content=el.innerHTML;b.style.fontSize=tag==='h1'?28:tag==='h2'?22:18;blocks.push(b);}
    else if(tag==='p'){const a=el.querySelector('a');const txt=(el.textContent||'').trim();
      if(a&&CTA.some(w=>(a.textContent||'').toLowerCase().includes(w))&&txt===a.textContent.trim()){const b=makeBlock('button');b.content=a.textContent;b.href=a.href;blocks.push(b);}
      else if(el.querySelector('img')&&!txt){const im=el.querySelector('img');const b=makeBlock('image');b.src=im.src;b.alt=im.alt;blocks.push(b);}
      else if(txt){const b=makeBlock('text');b.content=el.innerHTML;blocks.push(b);}}
    else if(tag==='img'){const b=makeBlock('image');b.src=el.src;b.alt=el.alt;blocks.push(b);}
    else if(tag==='ul'||tag==='ol'){const b=makeBlock('text');b.content=el.outerHTML;blocks.push(b);}
    else if(tag==='hr'){blocks.push(makeBlock('divider'));}
    else if(el.children.length){walk(el);}
    else if((el.textContent||'').trim()){const b=makeBlock('text');b.content=el.innerHTML;blocks.push(b);}
  }};
  walk(d);
  if(!blocks.length){const b=makeBlock('text');b.content=html;blocks.push(b);}
  return blocks;
}
importBtn.onclick=()=>{
  snapshot();
  if(uploadKind==='html'){
    const fixed=applyImgUrls(rawHtml,true);
    const b=makeBlock('raw'); b.content=inlineCss(fixed); doc.blocks=[b];
  } else {
    const fixed=applyImgUrls(convertedHtml,false);
    doc.blocks=importToBlocks(fixed);
  }
  selected=null;modal.classList.remove('show');analysis.style.display='none';dropZone.style.display='block';dropText.textContent='Drop a .docx or .html file here, or click to choose';renderAll();
  toastMsg(uploadKind==='html'?'HTML imported (CSS inlined, layout preserved)':'Imported into editor');
};

/* ---------- export buttons (added to inspector area via toast helper) ---------- */
function download(text,name,mime){const b=new Blob([text],{type:mime});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;a.click();URL.revokeObjectURL(u);}
function toastMsg(m){toast.textContent=m;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),1400);}

/* export controls injected into header */
const exp1=document.createElement('button');exp1.className='btn';exp1.textContent='⬇ HTML';exp1.onclick=()=>download(exportEmail(),(doc.name||'email')+'.html','text/html');
const exp2=document.createElement('button');exp2.className='btn';exp2.textContent='⧉ Copy';exp2.onclick=()=>{navigator.clipboard.writeText(exportEmail());toastMsg('Email HTML copied');};
document.querySelector('header .spacer').after(exp2,exp1);

/* ---------- start fresh each load (no autosave restore) ---------- */
try{localStorage.removeItem('eb-doc');}catch(e){}

renderAll();
