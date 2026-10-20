(function(){
 'use strict';
 const store=new Map(), handlers={},effects=[];let context={id:'root',hooks:0},rootComponent,root,rendering=false,pending=false;
 const F=Symbol('Fragment');
 function createElement(type,props,...children){return {type,props:{...(props||{}),children:children.flat(Infinity)}}}
 const React={createElement,Fragment:F,useState(initial){const ctx=context,key=ctx.id+':'+ctx.hooks++;let record=store.get(key);if(!record){record={value:typeof initial==='function'?initial():initial};store.set(key,record)}return [record.value,function(next){record.value=typeof next==='function'?next(record.value):next;schedule()}]},useEffect(callback,deps){const ctx=context,key=ctx.id+':'+ctx.hooks++;let old=store.get(key);if(!old||!same(deps,old.deps)){effects.push(()=>{if(old?.cleanup)old.cleanup();const cleanup=callback();store.set(key,{deps,cleanup})})}},useMemo(callback,deps){const ctx=context,key=ctx.id+':'+ctx.hooks++;let old=store.get(key);if(!old||!same(deps,old.deps)){old={value:callback(),deps};store.set(key,old)}return old.value},useRef(initial){const ctx=context,key=ctx.id+':'+ctx.hooks++;let r=store.get(key);if(!r){r={current:initial};store.set(key,r)}return r}}
 function same(a,b){return Array.isArray(a)&&Array.isArray(b)&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]))}
 function schedule(){if(pending)return;pending=true;queueMicrotask(()=>{pending=false;render()})}
 function escape(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
 function cssName(k){return k.replace(/[A-Z]/g,m=>'-'+m.toLowerCase())}
 function styleString(o){if(typeof o==='string')return o;return Object.entries(o||{}).map(([k,v])=>cssName(k)+':'+v).join(';')}
 function toHTML(v,path='0'){
  if(v==null||v===false||v===true)return '';
  if(Array.isArray(v))return v.map((x,i)=>toHTML(x,path+'.'+i)).join('');
  if(typeof v!=='object')return escape(v);
  if(v.type===F)return toHTML(v.props.children,path+'f');
  if(typeof v.type==='function'){const old=context;context={id:path+':'+(v.type.name||'Fn'),hooks:0};let out;try{out=v.type(v.props||{})}catch(e){console.error('Render error',context,e);out=createElement('div',{},'Error: '+e.message)}context=old;return toHTML(out,path+'.c')}
  const tag=v.type;const props=v.props||{};let attrs='';
  for(const [k,value] of Object.entries(props)){
   if(k==='children'||k==='key'||k==='ref'||k==='dangerouslySetInnerHTML')continue;
   if(k.startsWith('on')&&typeof value==='function'){const id=Object.keys(handlers).length+1;handlers[id]=value;attrs+=' data-'+k.toLowerCase()+'="'+id+'"';continue}
   const key=k==='className'?'class':k==='htmlFor'?'for':k;
   if(k==='style'){attrs+=' style="'+escape(styleString(value))+'"';continue}
   if(typeof value==='boolean'){if(value)attrs+=' '+key;continue}
   if(value!=null)attrs+=' '+key+'="'+escape(value)+'"';
  }
  if(['img','input','br','hr','meta','link','source'].includes(tag))return '<'+tag+attrs+'>';
  return '<'+tag+attrs+'>'+toHTML(props.children,path+'.'+tag)+'</'+tag+'>';
 }
 function render(){if(!root||rendering)return;rendering=true;for(const k of Object.keys(handlers))delete handlers[k];const active=document.activeElement;let preserve=null;if(active&&root.contains(active)&&active.tagName==='INPUT'){const inputList=[...root.querySelectorAll('input')],idx=inputList.indexOf(active);preserve={idx,start:active.selectionStart,end:active.selectionEnd}}
  let tree=createElement(rootComponent,null);const html=toHTML(tree);root.innerHTML=html;
  if(preserve){let el=root.querySelectorAll('input')[preserve.idx];if(el){el.focus();try{el.setSelectionRange(preserve.start,preserve.end)}catch{}}}
  while(effects.length){let fn=effects.shift();try{fn()}catch(e){console.warn('effect:',e)}}rendering=false;
 }
 function onEvent(ev){let name='data-on'+ev.type;let el=ev.target.closest('['+name+']');if(!el)return;let fn=handlers[el.getAttribute(name)];if(fn){fn(ev)}}
 for(const type of ['click','input','change','keydown','submit','focus']){document.addEventListener(type,(ev)=>{if(type==='input'){const target=ev.target;let f=target.getAttribute('data-onchange');if(f&&handlers[f]){handlers[f]({target:{value:target.value}});return}}if(type==='focus'){const target=ev.target;let f=target.getAttribute('data-onfocus');if(f&&handlers[f])handlers[f](ev);return}onEvent(ev)},type==='focus')}
 React.mount=(C,el)=>{rootComponent=C;root=el;render()};window.React=React;window.MiniReact=React;
 // Draw lightweight local SVG controls for the offline preview. React/Vite uses real lucide-react icons.
 const glyphs={
  ArrowRight:'M5 12h14m-6-6 6 6-6 6',ArrowLeft:'M19 12H5m6-6-6 6 6 6',ChevronRight:'m9 18 6-6-6-6',ChevronLeft:'m15 18-6-6 6-6',Search:'M11 3a8 8 0 1 0 0 16a8 8 0 0 0 0-16m6 14 5 5',Menu:'M4 6h16M4 12h16M4 18h16',X:'M5 5l14 14M19 5L5 19',Sun:'M12 3v2M12 19v2M3 12h2M19 12h2M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2M12 7a5 5 0 1 0 0 10a5 5 0 0 0 0-10',Moon:'M19 14A8 8 0 0 1 10 5a8 8 0 1 0 9 9',Play:'m8 5 11 7-11 7z',CirclePlay:'M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20m-3-4 12-4-12-4z',Star:'m12 2 3 6 6 1-4.5 4.5 1 7.5-6.5-3.5L5 20l1-7.5L2 9l7-1z',Zap:'m13 2-9 11h7l-1 9 10-12h-7z',Church:'M4 22V10l8-7 8 7v12M2 22h20M12 2v10m-4-4h8M9 22v-7h6v7',GraduationCap:'m2 9 10-5 10 5-10 5zM6 12v5c3 3 9 3 12 0v-5',Camera:'M3 7h4l2-3h6l2 3h4v13H3zM12 10a4 4 0 1 0 0 8a4 4 0 0 0 0-8',Heart:'M12 21 3 12C-2 4 7 1 12 7c5-6 14-3 9 5z',Users:'M9 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6M15 10a3 3 0 1 0 0-6a3 3 0 0 0 0 6M3 20v-3c0-4 12-4 12 0v3M13 15c4-2 8-1 8 3v2',MessageCircle:'M12 3a9 9 0 1 0 0 18c2 0 4-1 5-2l4 2-1-5a9 9 0 0 0-8-13',Video:'M3 5h14v14H3zM17 10l5-4v12l-5-4',BookOpen:'M12 6C9 3 5 3 2 4v15c4-1 8-1 10 2m0-15c3-3 7-3 10-2v15c-4-1-8-1-10 2z',CalendarDays:'M4 6h16v16H4zM8 2v7M16 2v7M4 11h16',Quote:'M11 6c-6 0-8 5-8 11h7l1-8M22 6c-6 0-8 5-8 11h7l1-8',Clock3:'M12 3a9 9 0 1 0 0 18a9 9 0 0 0 0-18m0 4v6l4 2',Bookmark:'M6 3h12v18l-6-4-6 4z',Mail:'M3 5h18v14H3zM3 6l9 7 9-7',Instagram:'M3 3h18v18H3zM12 8a4 4 0 1 0 0 8a4 4 0 0 0 0-8M18 6h1',Youtube:'M3 6h18v12H3zM10 8l6 4-6 4z',Facebook:'M14 22V10h5M9 15h10M16 3c-5-1-5 4-5 7',Headphones:'M3 16V11a9 9 0 0 1 18 0v5M3 16h4v5H3zM17 16h4v5h-4z',Globe2:'M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20M2 12h20M12 2c-6 7-6 13 0 20M12 2c6 7 6 13 0 20',CircleUserRound:'M12 2a10 10 0 1 0 0 20a10 10 0 0 0 0-20M12 6a4 4 0 1 0 0 8a4 4 0 0 0 0-8M4 18c3-5 13-5 16 0',Sparkles:'m12 2 2 7 7 3-7 3-2 7-3-7-7-3 7-3z',HandHeart:'M2 16l8 4 10-5-2-3-8 3M4 16V8M8 4c2-2 4 0 4 2 0-2 4-4 6 0s-6 8-6 8-8-6-4-10',Check:'m4 12 5 5 11-11'};
 function makeIcon(name){return function Icon(props){const size=props.size||24;return React.createElement('svg',{width:size,height:size,viewBox:'0 0 24 24',className:props.className||'',style:props.style,fill:props.fill||'none',stroke:'currentColor',strokeWidth:props.strokeWidth||1.8,strokeLinecap:'round',strokeLinejoin:'round','aria-hidden':'true'},React.createElement('path',{d:glyphs[name]||'M4 4h16v16H4zM6 12h12'}))}}
  Object.assign(glyphs,{House:'m3 10 9-7 9 7v11H3zM9 21v-7h6v7',School:'M3 21V7l9-4 9 4v14M2 21h20M9 21v-7h6v7M8 9h1M15 9h1',Palette:'M12 3a9 9 0 1 0 0 18h2a2 2 0 0 0 2-3c-1-2 0-3 2-3h1a4 4 0 0 0 3-4 9 9 0 0 0-10-8M7 11h.01M10 7h.01M16 8h.01',UsersRound:glyphs.Users,MessagesSquare:'M3 4h17v12H8l-5 4zM7 9h9M7 12h6',Clapperboard:'M3 8h18v13H3zM3 8l2-5h16v5M9 3 7 8M16 3l-2 5',Newspaper:'M4 3h16v18H4zM7 7h10M7 11h4v6H7zM14 11h3M14 14h3M14 17h3',NotebookPen:'M5 3h14v18H5zM8 7h7M8 11h6M16 16l4-4',Shapes:'M3 4h9v9H3zM16 4l6 9H10zM16 16a4 4 0 1 0 0 8a4 4 0 0 0 0-8',MessageSquareQuote:'M3 4h18v13H8l-5 4zM8 9h3v3H8zM14 9h3v3h-3z',Lightbulb:'M12 2a7 7 0 0 0-4 13v3h8v-3a7 7 0 0 0-4-13M9 21h6',Grid2X2:'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z'});
  const names='ArrowRight ArrowLeft Search Menu X Sun Moon Play ChevronRight ChevronLeft Church GraduationCap Camera Heart Users MessageCircle Video BookOpen CalendarDays CirclePlay Sparkles Star Zap HandHeart Clock3 Bookmark Mail Instagram Youtube Facebook Headphones Volume2 CheckCircle2 Send Quote Leaf Check Globe2 ExternalLink Share2 Compass CircleUserRound School MoveRight House Palette UsersRound MessagesSquare Clapperboard Newspaper NotebookPen Shapes MessageSquareQuote Lightbulb Grid2X2'.split(' ');
 for(const name of names)window[name]=makeIcon(name);
})();
