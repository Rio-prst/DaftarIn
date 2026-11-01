import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { useApp } from '../context/AppContext';
import { mockAuth } from '../auth/mockAuth';
import { recordTime } from '../utils/dashboard';
import { appendOperationAudit, EMPTY_AUDIT, EMPTY_DRAFTS, EMPTY_VERSIONS, safeSourceUrl, sourceReviewLabels, sourceReviewStatus, useOperationStore } from '../utils/operations';

export function AdminOverviewPage() {
  const {reviewQueue,services}=useApp();
  const accounts=mockAuth.listAccounts();
  const drafts=useOperationStore('daftarin:guide-drafts:v1',EMPTY_DRAFTS);
  const pending=reviewQueue.filter(item=>!['SELESAI','HASIL_DITERIMA_WARGA','DITARIK'].includes(item.current_status));
  const officers=accounts.filter(item=>item.role==='petugas');
  const assignable=new Set(officers.filter(item=>item.active!==false).map(item=>item.id));
  const unassigned=pending.filter(item=>!item.assigned_officer_id||!assignable.has(item.assigned_officer_id));
  const sources=services.filter(item=>sourceReviewStatus(item)!=='sesuai');
  return <WorkspaceLayout title="Ringkasan operasional" description="Tindak lanjuti penugasan dan panduan yang membutuhkan perhatian.">
    <div className="grid gap-4 sm:grid-cols-3 mb-6">{[
      {label:'Butuh penugasan',count:unassigned.length,href:'/admin/petugas?tab=penugasan&assignment=attention'},
      {label:'Panduan perlu ditinjau',count:sources.length,href:'/admin/sumber?status=attention'},
      {label:'Draf belum diterbitkan',count:Object.keys(drafts).length,href:'/admin/layanan?draft=1'},
    ].map(item=><Link key={item.label} to={item.href} className="plain-panel block"><span className="text-sm text-slate-600">{item.label}</span><strong className="block text-3xl mt-2">{item.count}</strong><span className="text-link inline-block text-sm mt-3">Tindak lanjuti →</span></Link>)}</div>
    <section className="plain-panel"><h2 className="panel-title">Beban tinjauan petugas</h2><p className="text-sm text-slate-600 mt-2">Jumlah permintaan aktif yang ditugaskan, termasuk yang masih menunggu perbaikan warga.</p>
      <ul className="divide-y divide-slate-200 mt-3">{officers.map(officer=>{const assigned=pending.filter(item=>item.assigned_officer_id===officer.id);return <li key={officer.id} className="py-4 flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-medium">{officer.name}</h3><p className="text-sm text-slate-600 mt-1">{officer.active===false?'Akses nonaktif':'Akses aktif'} · {assigned.length} permintaan aktif · {assigned.filter(item=>item.current_status==='VERIFIKASI').length} sedang ditinjau</p></div><Link className="text-link min-h-[44px] inline-flex items-center" to={'/admin/petugas?tab=penugasan&officer='+encodeURIComponent(officer.id)}>Lihat penugasan →</Link></li>})}</ul>
      {!officers.length&&<div className="mt-4"><p className="text-sm">Belum ada akun petugas.</p><Link className="text-link inline-flex min-h-[44px] items-center" to="/admin/petugas">Tambahkan petugas →</Link></div>}
    </section>
    <section className="plain-panel mt-5"><h2 className="panel-title">Permintaan yang perlu penugasan</h2>{unassigned.length?<ul className="divide-y divide-slate-200 mt-3">{unassigned.slice(0,5).map(item=><li key={item.id} className="py-3"><p className="font-medium">{item.service_name}</p><p className="text-sm text-slate-600 mt-1">{item.internal_reference} · {item.applicant_name}</p><Link className="text-link inline-flex items-center min-h-[44px]" to={'/admin/petugas?tab=penugasan&q='+encodeURIComponent(item.internal_reference||item.applicant_name)}>Atur penugasan →</Link></li>)}</ul>:<p className="text-sm text-slate-600 mt-3">Seluruh permintaan aktif sudah memiliki petugas yang aktif.</p>}</section>
  </WorkspaceLayout>;
}

export function AdminSourcesPage() {
  const {services,user,reviewServiceSource}=useApp();
  const versions=useOperationStore('daftarin:guide-versions:v1',EMPTY_VERSIONS);
  const [params,setParams]=useSearchParams();
  const query=params.get('q')||'';
  const status=params.get('status')||'';
  const selected=services.find(item=>String(item.id)===params.get('service'));
  const [reviewKey,setReviewKey]=useState(selected ? `${selected.id}:${selected.version||1}` : '');
  const selectedId=selected?.id;
  useEffect(()=>{if(selectedId)document.getElementById('source-review-heading')?.focus();},[selectedId]);
  const [decision,setDecision]=useState<'sesuai'|'perlu_perbaikan'>('sesuai');
  const [note,setNote]=useState('');
  const [acknowledged,setAcknowledged]=useState(false);
  const [error,setError]=useState('');
  const rows=services.filter(item=>[item.name,item.agency,item.source_url].join(' ').toLowerCase().includes(query.toLowerCase())&&(!status||status==='attention'&&sourceReviewStatus(item)!=='sesuai'||sourceReviewStatus(item)===status));
  const update=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);setParams(next,{replace:key==='q'});};
  return <WorkspaceLayout title="Sumber & versi panduan" description="Tinjau kesesuaian panduan dengan sumbernya dan telusuri perubahan yang pernah diterbitkan.">
    <div className="grid gap-4 sm:grid-cols-[1fr_240px] mb-5"><div className="form-field"><label htmlFor="sources-query">Cari layanan atau sumber</label><input id="sources-query" type="search" maxLength={160} value={query} onChange={event=>update('q',event.target.value)} /></div><div className="form-field"><label htmlFor="sources-status">Status peninjauan</label><select id="sources-status" value={status} onChange={event=>update('status',event.target.value)}><option value="">Semua panduan</option><option value="attention">Perlu perhatian</option>{Object.entries(sourceReviewLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div></div>
    <ul className="plain-panel divide-y divide-slate-200" aria-label="Daftar sumber panduan">{rows.map(item=><li key={item.id} className="py-4"><h2 className="font-semibold">{item.name}</h2><p className="text-sm text-slate-600 mt-1">Versi {item.version||1} · {sourceReviewLabels[sourceReviewStatus(item)]}</p><p className="text-sm text-slate-600 mt-2">{item.source_title||'Sumber belum diberi nama'}</p><div className="flex flex-wrap gap-4 mt-2">{safeSourceUrl(item.source_url)&&<a href={safeSourceUrl(item.source_url)} target="_blank" rel="noreferrer" className="text-link inline-flex items-center min-h-[44px]">Buka sumber panduan ↗</a>}<button type="button" className="text-link min-h-[44px]" onClick={()=>{update('service',String(item.id));setReviewKey(`${item.id}:${item.version||1}`);setNote('');setError('');setAcknowledged(false);}}>Tinjau sumber & versi</button><Link className="text-link inline-flex min-h-[44px] items-center" to={'/admin/layanan?service='+item.id}>Edit panduan →</Link></div></li>)}</ul>
    {!rows.length&&<div className="empty-state"><h2>Panduan tidak ditemukan</h2><button type="button" className="button-secondary" onClick={()=>setParams({})}>Hapus filter</button></div>}
    {selected&&<section key={selected.id+'-'+selected.version} className="plain-panel mt-5" aria-label="Peninjauan sumber terpilih">
      <h2 id="source-review-heading" tabIndex={-1} className="panel-title">{selected.name} · versi {selected.version||1}</h2><p className="text-sm text-slate-600 mt-2">Peninjauan dicatat oleh admin DaftarIn. Tidak menyatakan persetujuan dari instansi pemerintah.</p>
      <h3 className="font-medium mt-4">Persyaratan terbit</h3><ul className="list-disc pl-5 text-sm mt-2 space-y-1">{selected.requirements.map((item,index)=><li key={index}>{item}</li>)}</ul>
      {selected.source_note&&<p className="text-sm text-slate-600 mt-4">Catatan saat ini: {selected.source_note}</p>}
      {selected.source_review_by&&<p className="text-sm text-slate-500 mt-2">Ditinjau {selected.source_review_by} · {selected.reviewed_at}</p>}
      {reviewKey!==`${selected.id}:${selected.version||1}`&&<div className="mt-4"><p className="text-sm">Versi panduan telah berubah sejak peninjauan dibuka.</p><button type="button" className="button-secondary mt-2" onClick={()=>{setReviewKey(`${selected.id}:${selected.version||1}`);setAcknowledged(false);setNote('');setError('');}}>Muat sumber versi terbaru</button></div>}
      <form className="auth-form mt-5" onSubmit={event=>{event.preventDefault();try{if(reviewKey!==`${selected.id}:${selected.version||1}`)throw new Error('Versi panduan telah berubah. Muat versi terbaru dan tinjau sumber kembali.');if(!acknowledged)throw new Error('Pastikan sumber sudah dibaca sebelum menyimpan peninjauan.');reviewServiceSource(selected.id,selected.version||1,decision,note);appendOperationAudit(`Sumber panduan ditinjau: ${selected.name} · versi ${selected.version||1} · ${sourceReviewLabels[decision]}`,user.name);setError('');update('service','');}catch(cause){setError(cause instanceof Error?cause.message:'Peninjauan belum disimpan.');}}}>
        <div className="form-field"><label htmlFor="source-review-decision">Hasil peninjauan</label><select id="source-review-decision" value={decision} onChange={event=>setDecision(event.target.value as 'sesuai'|'perlu_perbaikan')}><option value="sesuai">Panduan sesuai sumber yang ditinjau</option><option value="perlu_perbaikan">Panduan memerlukan pembaruan</option></select></div>
        <div className="form-field"><label htmlFor="source-review-note">Catatan peninjauan</label><textarea id="source-review-note" rows={3} maxLength={2000} value={note} onChange={event=>setNote(event.target.value)} /></div>
        <label className="flex gap-3 items-start min-h-[44px] py-2"><input type="checkbox" checked={acknowledged} onChange={event=>setAcknowledged(event.target.checked)} /><span>Saya sudah membaca sumber dan membandingkannya dengan panduan versi ini.</span></label>
        {error&&<p className="form-error" role="alert">{error}</p>}<div className="flex flex-wrap gap-3"><button type="submit" className="button-primary">Simpan peninjauan sumber</button><button type="button" className="button-secondary" onClick={()=>update('service','')}>Tutup</button></div>
      </form>
      <h3 className="font-medium mt-6">Versi sebelumnya</h3>{versions.filter(item=>item.service.id===selected.id).map((item,index)=><details key={item.preservedAt+index} className="border-b border-slate-200 py-3"><summary className="cursor-pointer min-h-[44px] py-2">Versi {item.service.version||1} · disimpan {item.preservedAt}</summary><p className="text-sm mt-2">{item.service.description}</p><ul className="list-disc pl-5 text-sm space-y-1 mt-2">{item.service.requirements.map((requirement,i)=><li key={i}>{requirement}</li>)}</ul>{safeSourceUrl(item.service.source_url)&&<a className="text-link inline-flex min-h-[44px] items-center text-sm" href={safeSourceUrl(item.service.source_url)} rel="noreferrer" target="_blank">Sumber pada versi ini ↗</a>}</details>)}
      {!versions.some(item=>item.service.id===selected.id)&&<p className="text-sm text-slate-500 mt-2">Belum ada versi sebelumnya yang tersimpan.</p>}
    </section>}
  </WorkspaceLayout>;
}

export function AdminActivityPage() {
  const {operationalEvents}=useApp();
  const audit=useOperationStore('daftarin:audit:v1',EMPTY_AUDIT);
  const [params,setParams]=useSearchParams();
  const query=params.get('q')||'',category=params.get('category')||'';
  const classify=(message:string)=>/sumber/i.test(message)?'sumber':/panduan/i.test(message)?'panduan':/aturan/i.test(message)?'aturan':/akun|akses/i.test(message)?'akun':'lainnya';
  const rows=[...audit.map(item=>({...item,category:classify(item.message),reference:''})),...operationalEvents].filter(item=>(!category||item.category===category)&&[item.message,item.by,item.reference].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b)=>recordTime(b.time)-recordTime(a.time));
  const pages=Math.max(1,Math.ceil(rows.length/20)),requested=Number(params.get('page')||1),page=Math.max(1,Math.min(pages,Number.isSafeInteger(requested)?requested:1));
  const update=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');setParams(next,{replace:key==='q'});};
  return <WorkspaceLayout title="Riwayat aktivitas" description="Telusuri perubahan panduan, akses petugas, penugasan, dan keputusan tinjauan.">
    <div className="grid gap-4 sm:grid-cols-[1fr_240px] mb-5"><div className="form-field"><label htmlFor="activity-query">Cari aktivitas, pelaku, atau nomor</label><input id="activity-query" type="search" maxLength={160} value={query} onChange={event=>update('q',event.target.value)} /></div><div className="form-field"><label htmlFor="activity-category">Jenis aktivitas</label><select id="activity-category" value={category} onChange={event=>update('category',event.target.value)}><option value="">Semua aktivitas</option>{['panduan','sumber','akun','aturan','penugasan','tinjauan'].map(item=><option key={item} value={item}>{item[0].toUpperCase()+item.slice(1)}</option>)}</select></div></div>
    <p className="text-sm text-slate-600 mb-3" role="status">{rows.length} aktivitas ditemukan</p>
    <ol className="plain-panel divide-y divide-slate-200" aria-label="Daftar aktivitas">{rows.slice((page-1)*20,page*20).map(item=><li key={item.id} className="py-4"><h2 className="font-medium">{item.message}</h2><p className="text-sm text-slate-600 mt-2">{item.by} · {item.time}{item.reference?' · '+item.reference:''}</p></li>)}</ol>
    {!rows.length&&<div className="empty-state"><h2>Belum ada aktivitas yang sesuai</h2>{(query||category)&&<button type="button" className="button-secondary" onClick={()=>setParams({})}>Hapus filter</button>}</div>}
    {pages>1&&<nav aria-label="Halaman aktivitas" className="flex justify-between flex-wrap gap-3 mt-4"><button className="button-secondary" disabled={page===1} onClick={()=>update('page',String(page-1))}>Sebelumnya</button><span>Halaman {page} dari {pages}</span><button className="button-secondary" disabled={page===pages} onClick={()=>update('page',String(page+1))}>Berikutnya</button></nav>}
  </WorkspaceLayout>;
}
