const K='lbl-v1',$=s=>document.querySelector(s);
let S;try{S=JSON.parse(localStorage.getItem(K))}catch(_){}
S=S&&S.weeks?S:{habits:['Drink water','Read for 10 minutes','Move a little'],weeks:{}};
let cur=mon(new Date()),ed=null;
function mon(d){d=new Date(d.getFullYear(),d.getMonth(),d.getDate());d.setDate(d.getDate()-((d.getDay()+6)%7));return d}
function key(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function wk(){const k=key(cur);return S.weeks[k]||(S.weeks[k]={goals:[],tasks:[[],[],[],[],[],[],[]],h:{},notes:'',refl:''})}
function save(){try{localStorage.setItem(K,JSON.stringify(S))}catch(_){}}
const e=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,5);
const arr=(t,d)=>t==='g'?wk().goals:wk().tasks[d];
function item(t,d,o){
 const a=`data-t="${t}" data-d="${d}" data-id="${o.id}"`;
 return `<li class="it${o.x?' done':''}"><input type="checkbox" ${o.x?'checked':''} data-a="tog" ${a} aria-label="Mark done">`+
 (ed===o.id?`<input type="text" class="ei" value="${e(o.t)}" data-a="ed" ${a} aria-label="Edit text">`:`<span>${e(o.t)}</span>`)+
 `<button data-a="edit" ${a} aria-label="Edit ${e(o.t)}">Edit</button><button data-a="del" ${a} aria-label="Delete ${e(o.t)}">×</button></li>`}
function render(){
 const w=wk(),f=d=>d.toLocaleDateString('en-GB',{day:'numeric',month:'short'}),td=key(new Date());
 const days=[...Array(7)].map((_,i)=>{const d=new Date(cur);d.setDate(d.getDate()+i);return d});
 const dn=d=>d.toLocaleDateString('en-GB',{weekday:'long'});
 $('#wl').textContent=f(days[0])+' – '+f(days[6])+' '+days[6].getFullYear();
 $('#goals').innerHTML=w.goals.map(o=>item('g',0,o)).join('')||'<li class="empty">No goals yet. Add one thing that matters this week.</li>';
 $('#days').innerHTML=days.map((d,i)=>`<section class="card day${key(d)===td?' today':''}"><h3>${dn(d)}</h3><p class="dt">${f(d)}</p><ul>${w.tasks[i].map(o=>item('t',i,o)).join('')}</ul><div class="add"><input type="text" data-a="new" data-t="t" data-d="${i}" placeholder="Add a task" aria-label="Add a task for ${dn(d)}"><button class="sm" data-a="add" data-t="t" data-d="${i}">Add</button></div></section>`).join('');
 const hh='<div class="hh"><span></span>'+days.map(d=>`<span>${d.toLocaleDateString('en-GB',{weekday:'narrow'})}</span>`).join('')+'<span></span></div>';
 $('#habits').innerHTML=S.habits.length?hh+S.habits.map(n=>{const a=w.h[n]||[];return `<div class="hr"><span>${e(n)}</span>`+days.map((d,i)=>`<input type="checkbox" data-a="hab" data-n="${e(n)}" data-i="${i}" ${a[i]?'checked':''} aria-label="${e(n)}, ${dn(d)}">`).join('')+`<button data-a="hdel" data-n="${e(n)}" aria-label="Remove ${e(n)}">×</button></div>`}).join(''):'<p class="empty">No habits yet. Add one small habit to begin.</p>';
 const all=w.tasks.flat(),done=all.filter(o=>o.x).length,gd=w.goals.filter(o=>o.x).length;
 const hc=S.habits.reduce((s,n)=>s+(w.h[n]||[]).filter(Boolean).length,0),pc=all.length?Math.round(done/all.length*100):0;
 const cl=w.tasks.map((a,i)=>a.filter(o=>o.x).map(o=>dn(days[i])+': '+e(o.t))).flat();
 $('#prog').innerHTML=`<p class="big">${pc}%</p><div class="track" role="progressbar" aria-label="Tasks completed" aria-valuenow="${pc}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pc}%"></i></div><p>${done} of ${all.length} tasks done.<br>${gd} of ${w.goals.length} goals reached.<br>${hc} habit check-ins this week.</p><details><summary>Completed tasks (${done})</summary>${cl.length?'<ul>'+cl.map(x=>`<li>${x}</li>`).join('')+'</ul>':'<p class="empty">Nothing ticked off yet.</p>'}</details>`;
 $('#notes').value=w.notes;$('#refl').value=w.refl;
}
function add(t,d,inp){const v=inp.value.trim();if(!v)return;arr(t,d).push({id:uid(),t:v,x:false});save();render();const n=$(`[data-a="new"][data-t="${t}"][data-d="${d}"]`);n&&n.focus()}
function addHabit(inp){const v=inp.value.trim();if(!v||S.habits.includes(v))return;S.habits.push(v);save();render();$('[data-a="hnew"]').focus()}
function commit(el,ok){if(ed===null)return;const o=arr(el.dataset.t,el.dataset.d).find(x=>x.id===el.dataset.id),v=el.value.trim();if(ok&&o&&v)o.t=v;ed=null;save();render()}
document.addEventListener('click',ev=>{
 const b=ev.target.closest('button[data-a]');if(!b)return;const a=b.dataset.a,d=b.dataset;
 if(a==='prev'||a==='next'){cur.setDate(cur.getDate()+(a==='next'?7:-7));render()}
 else if(a==='today'){cur=mon(new Date());render()}
 else if(a==='add')add(d.t,d.d,b.parentNode.querySelector('input'));
 else if(a==='hadd')addHabit(b.parentNode.querySelector('input'));
 else if(a==='del'){const l=arr(d.t,d.d),i=l.findIndex(x=>x.id===d.id);if(i>-1)l.splice(i,1);save();render()}
 else if(a==='edit'){ed=d.id;render();const i=$('.ei');i&&(i.focus(),i.select())}
 else if(a==='hdel'){S.habits=S.habits.filter(n=>n!==d.n);save();render()}
});
document.addEventListener('change',ev=>{
 const c=ev.target,a=c.dataset.a;
 if(a==='tog'){const o=arr(c.dataset.t,c.dataset.d).find(x=>x.id===c.dataset.id);if(o){o.x=c.checked;save();render()}}
 else if(a==='hab'){const w=wk(),n=c.dataset.n;w.h[n]=w.h[n]||[];w.h[n][+c.dataset.i]=c.checked;save();render()}
});
document.addEventListener('keydown',ev=>{
 const c=ev.target,a=c.dataset&&c.dataset.a;
 if(a==='new'&&ev.key==='Enter')add(c.dataset.t,c.dataset.d,c);
 else if(a==='hnew'&&ev.key==='Enter')addHabit(c);
 else if(a==='ed'){if(ev.key==='Enter')commit(c,true);else if(ev.key==='Escape')commit(c,false)}
});
document.addEventListener('focusout',ev=>{if(ev.target.dataset&&ev.target.dataset.a==='ed')commit(ev.target,true)});
$('#notes').addEventListener('input',ev=>{wk().notes=ev.target.value;save()});
$('#refl').addEventListener('input',ev=>{wk().refl=ev.target.value;save()});
render();
