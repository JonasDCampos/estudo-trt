const KEY='planner-v1', TK='planner-token';
let D, edit=false;
const $=s=>document.querySelector(s);
const ks=p=>p.split('.');
const get=(p)=>ks(p).reduce((a,k)=>a[k],D);
const set=(p,v)=>{const a=ks(p),l=a.pop();a.reduce((o,k)=>o[k],D)[l]=v};
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ed=(p,t='span')=>`<${t} data-p="${p}">${esc(get(p))}</${t}>`;
const dirty=()=>!!localStorage.getItem(KEY+'-d');
const save=()=>{localStorage.setItem(KEY,JSON.stringify(D));localStorage.setItem(KEY+'-d','1');badge()};
const badge=()=>{const b=$('#badge');if(b)b.textContent=dirty()?'Alterações ainda não publicadas':''};
const CH=['teoria','questoes','rev24','rev7','rev30'];
const novoTopico=()=>({titulo:'Novo tópico',subtopicos:'Subtópicos',teoria:false,questoes:false,rev24:false,rev7:false,rev30:false,acertos:''});

function render(){
  const c=D.concurso, dias=Math.ceil((new Date(c.dataProva+'T00:00:00')-new Date())/864e5);
  const hoje=new Date().toLocaleDateString('pt-BR',{weekday:'long'});
  const prog=D.disciplinas.map((d,i)=>{const t=d.topicos.length*5;const n=d.topicos.reduce((s,x)=>s+CH.filter(k=>x[k]).length,0);const p=t?Math.round(n/t*100):0;
    return `<div class="in" style="gap:4px;font-size:13px"><span>${ed(`disciplinas.${i}.nome`)} · ${p}%</span><div class="bar"><i style="width:${p}%"></i></div></div>`}).join('');
  const cards=D.hoje.map((b,i)=>`<div class="card t-${esc(b.tipo)}"><span>${ed(`hoje.${i}.hora`)} · ${ed(`hoje.${i}.tipo`)}</span><strong>${ed(`hoje.${i}.titulo`)}</strong><span>${ed(`hoje.${i}.detalhe`)}</span><button class="ghost x" data-act="delb" data-i="${i}">Remover bloco</button></div>`).join('');
  const rows=D.disciplinas.map((d,i)=>`<tr class="disc"><td colspan="7">${ed(`disciplinas.${i}.nome`)} <button class="ghost x" data-act="addt" data-i="${i}">+ Tópico</button><button class="ghost x" data-act="deld" data-i="${i}">Remover disciplina</button></td></tr>`+
    d.topicos.map((t,j)=>{const b=`disciplinas.${i}.topicos.${j}`;return `<tr><td>${ed(b+'.titulo')}<small>${ed(b+'.subtopicos')}</small><button class="ghost x" data-act="delt" data-i="${i}" data-j="${j}">Remover tópico</button></td>`+
      CH.map((k,n)=>`<td><input type="checkbox" data-c="${b}.${k}" ${t[k]?'checked':''} aria-label="${['Teoria','Questões','Revisão 24h','Revisão 7 dias','Revisão 30 dias'][n]}: ${esc(t.titulo)}"></td>`).join('')+`<td>${ed(b+'.acertos')}</td></tr>`}).join('')).join('');
  $('#app').innerHTML=`<div class="wrap"><aside><div class="in"><span class="kick">Concurso</span><strong style="font-size:18px;line-height:1.3">${ed('concurso.nome')}</strong><span class="soft">${ed('concurso.cargo')} · ${ed('concurso.banca')}</span></div>
  <div class="in"><span class="big">${isNaN(dias)?'—':Math.max(dias,0)}</span><span class="soft">dias para a prova</span><span class="soft">Data (AAAA-MM-DD): ${ed('concurso.dataProva')}</span></div>
  <div style="display:flex;flex-direction:column;gap:12px"><span class="in soft">Progresso do edital</span>${prog}</div></aside>
  <main><div class="top"><div><h1>Hoje · ${hoje}</h1><span class="soft" style="color:#55607A">Meta do dia: ${ed('metaDia.horas')}h de estudo · ${ed('metaDia.questoes')} questões</span></div>
  <div class="tools"><button data-act="edit" class="${edit?'pri':''}">${edit?'Concluir edição':'Editar'}</button><button data-act="pub">Publicar no GitHub</button><button data-act="copy">Copiar JSON</button><button data-act="down">Baixar JSON</button></div></div>
  <span id="badge" class="badge" role="status"></span>
  <section class="cards">${cards}</section><button class="ghost" data-act="addb" style="align-self:flex-start">+ Bloco de hoje</button>
  <section class="box"><table><thead><tr><th>Edital verticalizado</th><th>Teoria</th><th>Questões</th><th>Rev. 24h</th><th>Rev. 7d</th><th>Rev. 30d</th><th>Acertos</th></tr></thead><tbody>${rows}</tbody></table></section>
  <button class="ghost" data-act="addd" style="align-self:flex-start">+ Disciplina</button>
  <button class="ghost x" data-act="reset" style="align-self:flex-start">Descartar alterações locais</button></main></div>`;
  document.body.classList.toggle('edit',edit);
  document.querySelectorAll('[data-p]').forEach(e=>e.contentEditable=edit?'plaintext-only':'false');
  badge();
}
const json=()=>JSON.stringify(D,null,2);
async function publish(){
  const g={usuario:$('#gu').value.trim(),repo:$('#gr').value.trim(),branch:$('#gb').value.trim()||'main'},t=$('#gt').value.trim(),m=$('#gm');
  if(!g.usuario||!g.repo||!t){m.textContent='Preencha usuário, repositório e token.';return}
  D.git=g;localStorage.setItem(TK,t);m.textContent='Publicando…';
  const u=`https://api.github.com/repos/${g.usuario}/${g.repo}/contents/edital.json`,h={Authorization:'Bearer '+t,Accept:'application/vnd.github+json'};
  try{
    const r=await fetch(`${u}?ref=${g.branch}`,{headers:h});const sha=r.ok?(await r.json()).sha:undefined;
    const p=await fetch(u,{method:'PUT',headers:h,body:JSON.stringify({message:'Atualiza cronograma pelo site',branch:g.branch,sha,content:btoa(unescape(encodeURIComponent(json())))})});
    if(!p.ok)throw new Error((await p.json()).message||p.status);
    localStorage.removeItem(KEY+'-d');m.textContent='Publicado. Aguarde cerca de 1 minuto para o site atualizar.';badge();
  }catch(e){m.textContent='Não foi possível publicar: '+e.message+'. Confira o token e o nome do repositório.'}
}
document.addEventListener('input',e=>{const p=e.target.dataset?.p;if(p){set(p,e.target.textContent);save()}});
document.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.dataset?.p){e.preventDefault();e.target.blur()}});
document.addEventListener('change',e=>{const c=e.target.dataset?.c;if(c){set(c,e.target.checked);save();render()}});
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,i=+b.dataset.i,j=+b.dataset.j;
  const A={
    edit:()=>{edit=!edit},
    addb:()=>{D.hoje.push({hora:'00:00–00:00',tipo:'Teoria',titulo:'Novo bloco',detalhe:'Detalhe'});save()},
    delb:()=>{D.hoje.splice(i,1);save()},
    addd:()=>{D.disciplinas.push({nome:'Nova disciplina',topicos:[novoTopico()]});save()},
    deld:()=>{if(confirm('Remover esta disciplina e seus tópicos?')){D.disciplinas.splice(i,1);save()}},
    addt:()=>{D.disciplinas[i].topicos.push(novoTopico());save()},
    delt:()=>{D.disciplinas[i].topicos.splice(j,1);save()},
    reset:()=>{if(confirm('Voltar ao conteúdo publicado e perder as alterações locais?')){localStorage.removeItem(KEY);localStorage.removeItem(KEY+'-d');location.reload()}},
    copy:()=>{navigator.clipboard.writeText(json());b.textContent='Copiado'},
    down:()=>{const l=document.createElement('a');l.href=URL.createObjectURL(new Blob([json()],{type:'application/json'}));l.download='edital.json';l.click()},
    pub:()=>{const g=D.git||{};$('#gu').value=g.usuario||'';$('#gr').value=g.repo||'';$('#gb').value=g.branch||'main';$('#gt').value=localStorage.getItem(TK)||'';$('#gm').textContent='';$('#dlg').showModal();return 1},
    pubgo:()=>{publish();return 1},
    close:()=>{$('#dlg').close();return 1}
  };
  if(!A[a]())render();
});
(async()=>{
  try{const l=localStorage.getItem(KEY);D=l?JSON.parse(l):await (await fetch('edital.json',{cache:'no-store'})).json();render()}
  catch(e){$('#app').textContent='Não foi possível carregar o edital.json. Abra o site pelo endereço do GitHub Pages.'}
})();
