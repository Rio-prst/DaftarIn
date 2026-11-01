import { Link, useSearchParams } from 'react-router-dom';
import { WorkspaceLayout } from '../components/WorkspaceLayout';
import { getReviewStatusLabel, useApp } from '../context/AppContext';
import { recordTime } from '../utils/dashboard';

export function OfficerOverviewPage() {
  const { applications, officerHistory } = useApp();
  const active = applications.filter(item => !['SELESAI', 'HASIL_DITERIMA_WARGA', 'DICATAT_WARGA','DITARIK'].includes(item.current_status));
  const waiting = active.filter(item => item.current_status === 'DITERIMA' || item.revision_pending);
  const reviewing = active.filter(item => ['VERIFIKASI','DIPROSES'].includes(item.current_status));
  const citizen = active.filter(item => item.current_status === 'PERLU_PERBAIKAN' && !item.revision_pending);
  const tasks = [...reviewing, ...waiting].sort((a,b) => recordTime(a.updated_at || a.created_at) - recordTime(b.updated_at || b.created_at));
  return <WorkspaceLayout title="Ringkasan pekerjaan" description="Lanjutkan tinjauan yang sedang dikerjakan dan periksa kiriman yang menunggu.">
    <div className="grid gap-4 sm:grid-cols-3 mb-6">
      {[{label:'Perlu ditinjau', count:waiting.length, status:'waiting'}, {label:'Sedang ditinjau',count:reviewing.length,status:'reviewing'}, {label:'Menunggu perbaikan warga',count:citizen.length,status:'revision'}].map(item => <Link key={item.status} to={'/petugas?status='+item.status} className="plain-panel block"><span className="text-sm text-slate-600">{item.label}</span><strong className="block text-3xl mt-2">{item.count}</strong><span className="text-link inline-block mt-3 text-sm">Buka antrean →</span></Link>)}
    </div>
    <section className="plain-panel" aria-label="Pekerjaan berikutnya">
      <h2 className="panel-title">Pekerjaan berikutnya</h2>
      <p className="text-sm text-slate-600 mt-2">Diurutkan dari pembaruan paling lama. Perbaikan yang sudah dikirim warga kembali masuk sebagai kiriman untuk ditinjau.</p>
      <ul className="divide-y divide-slate-200 mt-3">{tasks.slice(0,5).map(item => <li key={item.id} className="py-4">
        <h3 className="font-semibold">{item.applicant_name} · {item.service_name}</h3>
        <p className="text-sm text-slate-600 mt-1">{item.internal_reference} · {getReviewStatusLabel(item)}</p>
        <p className="text-sm mt-2">{item.revision_pending ? `Periksa kiriman perbaikan #${item.submitted_snapshot?.submissionVersion || 1}.` : item.current_status === 'DITERIMA' ? 'Mulai tinjauan data dan berkas yang sudah dikirim.' : 'Lanjutkan pemeriksaan dan tuliskan keputusan setelah semua bagian dinilai.'}</p>
        <Link className="text-link inline-flex items-center min-h-[44px]" to={'/petugas/'+encodeURIComponent(item.id)} state={{returnTo:'/petugas/ringkasan'}}>Buka tinjauan →</Link>
      </li>)}</ul>
      {!tasks.length && <p className="mt-4 text-sm text-slate-600">Tidak ada kiriman yang perlu ditinjau saat ini.{citizen.length ? ' Permintaan perbaikan masih menunggu tindakan warga.' : ''}</p>}
    </section>
    <section className="plain-panel mt-5"><h2 className="panel-title">Keputusan yang pernah dibuat</h2><p className="text-sm text-slate-600 mt-2">{officerHistory.length} keputusan tercatat atas akunmu. Riwayat tetap tersedia sebagai catatan pekerjaan setelah penugasan dipindahkan.</p><Link className="text-link inline-flex min-h-[44px] items-center mt-2" to="/petugas/riwayat">Cari riwayat tinjauan →</Link></section>
  </WorkspaceLayout>;
}

export function OfficerHistoryPage() {
  const { officerHistory, applications } = useApp();
  const [params,setParams] = useSearchParams();
  const query = params.get('q') || '';
  const decision = ['SELESAI','PERLU_PERBAIKAN'].includes(params.get('decision') || '') ? params.get('decision') || '' : '';
  const rows = officerHistory.filter(item => (!decision || item.decision === decision) && [item.reference,item.serviceName,item.summaryNote].join(' ').toLowerCase().includes(query.trim().toLowerCase())).sort((a,b) => recordTime(b.evaluatedAt)-recordTime(a.evaluatedAt));
  const pages = Math.max(1,Math.ceil(rows.length/10));
  const page = Math.min(pages,Math.max(1,Number.isSafeInteger(Number(params.get('page') || 1)) ? Number(params.get('page') || 1) : 1));
  const update = (key: string, value: string) => { const next=new URLSearchParams(params); if(value)next.set(key,value);else next.delete(key); if(key!=='page')next.delete('page');setParams(next,{replace:key==='q'}); };
  const legacy = applications.filter(item => item.current_status === 'SELESAI' && !item.latest_evaluation && !item.evaluation_history?.length && [item.internal_reference,item.service_name].join(' ').toLowerCase().includes(query.trim().toLowerCase()));
  return <WorkspaceLayout title="Riwayat tinjauan" description="Cari keputusan yang pernah kamu buat dan buka versi kiriman yang dinilai.">
    <div className="grid gap-4 sm:grid-cols-[1fr_240px] mb-5">
      <div className="form-field"><label htmlFor="officer-history-query">Cari nomor, layanan, atau catatan</label><input id="officer-history-query" type="search" maxLength={160} value={query} onChange={event=>update('q',event.target.value)} /></div>
      <div className="form-field"><label htmlFor="officer-history-decision">Keputusan</label><select id="officer-history-decision" value={decision} onChange={event=>update('decision',event.target.value)}><option value="">Semua keputusan</option><option value="SELESAI">Tinjauan selesai</option><option value="PERLU_PERBAIKAN">Perlu perbaikan</option></select></div>
    </div>
    <p className="text-sm text-slate-600 mb-3" role="status">{rows.length} keputusan ditemukan</p>
    <ul className="plain-panel divide-y divide-slate-200" aria-label="Daftar riwayat keputusan">{rows.slice((page-1)*10,page*10).map(item=><li key={item.id} className="py-4">
      <h2 className="font-semibold">{item.serviceName}</h2><p className="text-sm text-slate-600 mt-1">{item.reference} · Kiriman #{item.submissionVersion} · {item.evaluatedAt}</p>
      <p className="text-sm font-medium mt-2">{item.decision==='SELESAI'?'Tinjauan awal selesai':'Perlu perbaikan'}</p>
      {item.summaryNote && <p className="text-sm text-slate-600 mt-2">{item.summaryNote}</p>}
      {item.canOpen ? <Link className="text-link inline-flex min-h-[44px] items-center" to={'/petugas/riwayat/'+encodeURIComponent(item.applicationId)+'?version='+item.submissionVersion} state={{returnTo:'/petugas/riwayat?'+params.toString(),submissionVersion:item.submissionVersion}}>Buka riwayat kiriman →</Link> : <p className="text-sm text-slate-500 mt-2">Penugasan sudah dipindahkan. Data warga dan berkas tidak tersedia dari riwayat ini.</p>}
    </li>)}</ul>
    {!rows.length && <div className="empty-state"><h2>{query||decision?'Tidak ada keputusan yang sesuai':'Belum ada keputusan yang tercatat'}</h2><p>{query||decision?'Ubah pencarian atau pilihan keputusan.':'Keputusan yang kamu kirim setelah meninjau akan tercatat di sini.'}</p>{(query||decision)&&<button type="button" className="button-secondary" onClick={()=>setParams({})}>Hapus filter</button>}</div>}
    {pages>1&&<nav aria-label="Halaman riwayat" className="flex flex-wrap justify-between gap-3 mt-4"><button type="button" className="button-secondary" disabled={page===1} onClick={()=>update('page',String(page-1))}>Sebelumnya</button><span>Halaman {page} dari {pages}</span><button type="button" className="button-secondary" disabled={page===pages} onClick={()=>update('page',String(page+1))}>Berikutnya</button></nav>}
    {!!legacy.length&&!decision&&<section className="plain-panel mt-5"><h2 className="panel-title">Permintaan selesai dengan catatan lama</h2><p className="text-sm text-slate-600 mt-2">Permintaan ini masih ditugaskan kepadamu, tetapi keputusan per versi belum tercatat dalam format baru.</p>{legacy.map(item=><Link key={item.id} className="text-link block py-3" to={'/petugas/riwayat/'+encodeURIComponent(item.id)} state={{returnTo:'/petugas/riwayat?'+params.toString()}}>{item.internal_reference} · {item.service_name} →</Link>)}</section>}
  </WorkspaceLayout>;
}
