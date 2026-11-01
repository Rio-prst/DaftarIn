import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getReviewStatusLabel, useApp } from '../context/AppContext';
import { mockAuth } from '../auth/mockAuth';

export function AdminReviewAssignments() {
  const { reviewQueue, assignReviewOfficer } = useApp();
  const [selected, setSelected] = useState('');
  const [officerId, setOfficerId] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [params,setParams]=useSearchParams();
  const query=params.get('q')||'';
  const filterOfficer=params.get('officer')||'';
  const attention=params.get('assignment')==='attention';
  const accounts=mockAuth.listAccounts();
  const update=(key:string,value:string)=>{const next=new URLSearchParams(params);if(value)next.set(key,value);else next.delete(key);if(key!=='page')next.delete('page');setParams(next,{replace:key==='q'});};
  const officers = accounts.filter(account => account.role === 'petugas' && account.active !== false);
  const pending = reviewQueue.filter(item => !['SELESAI','HASIL_DITERIMA_WARGA','DITARIK'].includes(item.current_status));
  const filtered=pending.filter(item=>(!filterOfficer||item.assigned_officer_id===filterOfficer)&&(!attention||!officers.some(officer=>officer.id===item.assigned_officer_id))&&[item.applicant_name,item.service_name,item.internal_reference].join(' ').toLowerCase().includes(query.toLowerCase()));
  const pages=Math.max(1,Math.ceil(filtered.length/10)),requested=Number(params.get('page')||1),page=Math.max(1,Math.min(pages,Number.isSafeInteger(requested)?requested:1));
  const submit = (event: FormEvent) => {
    event.preventDefault();
    try { assignReviewOfficer(selected, officerId, reason); setSelected(''); setReason(''); setError(''); }
    catch(cause) { setError(cause instanceof Error ? cause.message : 'Penugasan belum disimpan.'); }
  };
  return <section className="plain-panel">
    <h2 className="panel-title">Penugasan tinjauan aktif</h2>
    <p className="text-sm text-slate-600 mt-2">Petugas pengganti memulai tinjauan ulang. Kiriman warga dan keputusan sebelumnya tetap tersimpan.</p>
    <div className="form-field mt-4"><label htmlFor="assignment-search">Cari warga, layanan, atau nomor tinjauan</label><input id="assignment-search" type="search" maxLength={160} value={query} onChange={event => update('q',event.target.value)} /></div>
    <div className="flex flex-wrap gap-4 mt-4"><div className="form-field"><label htmlFor="assignment-filter-officer">Petugas saat ini</label><select id="assignment-filter-officer" value={filterOfficer} onChange={event=>update('officer',event.target.value)}><option value="">Semua petugas</option>{accounts.filter(item=>item.role==='petugas').map(item=><option value={item.id} key={item.id}>{item.name}{item.active===false?' (nonaktif)':''}</option>)}</select></div><label className="flex items-center gap-3 min-h-[44px] text-sm"><input type="checkbox" checked={attention} onChange={event=>update('assignment',event.target.checked?'attention':'')} />Hanya yang butuh penugasan</label></div>
    <p className="text-sm text-slate-600 mt-3" role="status">{filtered.length} permintaan aktif ditemukan</p>
    <ul className="divide-y divide-slate-200 mt-3">{filtered.slice((page-1)*10,page*10).map(item => <li key={item.id} className="py-4">
      <h3 className="font-medium">{item.service_name} · {item.applicant_name}</h3>
      <p className="text-sm text-slate-600 mt-1">{item.internal_reference} · {getReviewStatusLabel(item)}</p>
      <p className="text-sm text-slate-600 mt-1">Petugas: {accounts.find(account => account.id === item.assigned_officer_id)?.name || 'Belum ditugaskan'}</p>
      <button className="button-secondary mt-3" type="button" onClick={() => {setSelected(item.id); setOfficerId(''); setReason(''); setError('');}}>Atur penugasan</button>
      {selected === item.id && <form onSubmit={submit} className="auth-form mt-3" noValidate>
        <div className="form-field"><label htmlFor="assignment-officer">Petugas penerima</label><select id="assignment-officer" value={officerId} onChange={event => setOfficerId(event.target.value)}><option value="">Pilih petugas aktif</option>{officers.filter(account => account.id !== item.assigned_officer_id).map(account => <option key={account.id} value={account.id}>{account.name}</option>)}</select></div>
        {!officers.some(account => account.id !== item.assigned_officer_id) && <p className="text-sm text-slate-600">Belum ada petugas pengganti yang aktif. Tambahkan atau aktifkan petugas melalui menu Akun.</p>}
        <div className="form-field"><label htmlFor="assignment-reason">Alasan penugasan</label><textarea id="assignment-reason" rows={2} maxLength={1000} value={reason} onChange={event => setReason(event.target.value)} /></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="flex gap-3"><button className="button-primary" type="submit">Simpan penugasan</button><button className="button-secondary" type="button" onClick={() => setSelected('')}>Batal</button></div>
      </form>}
    </li>)}</ul>
    {!filtered.length && <div className="empty-state"><p>{pending.length?'Tidak ada permintaan yang sesuai filter.':'Belum ada tinjauan aktif untuk ditugaskan.'}</p>{pending.length>0&&<button type="button" className="button-secondary" onClick={()=>setParams({tab:'penugasan'})}>Hapus filter</button>}</div>}
    {pages>1&&<nav aria-label="Halaman penugasan" className="flex flex-wrap justify-between gap-3 mt-4"><button type="button" className="button-secondary" disabled={page===1} onClick={()=>update('page',String(page-1))}>Sebelumnya</button><span>Halaman {page} dari {pages}</span><button type="button" className="button-secondary" disabled={page===pages} onClick={()=>update('page',String(page+1))}>Berikutnya</button></nav>}
  </section>;
}
