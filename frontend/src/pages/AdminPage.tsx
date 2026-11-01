import { ApiAdminWorkspace } from "./ApiAdminWorkspace";
import { HelpPage } from './HelpPage';
import { useState, type FormEvent } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { AdminOverviewPage, AdminSourcesPage, AdminActivityPage } from "./AdminOperationsPage";
import { appendOperationAudit, writeOperationStore, useOperationStore, EMPTY_DRAFTS, EMPTY_VERSIONS } from "../utils/operations";
import { WorkspaceLayout } from "../components/WorkspaceLayout";
import { PasswordField } from "../components/PasswordField";
import {
  useApp,
  type ServiceDetail,
  type AdminRule,
} from "../context/AppContext";
import { getServiceConditionConfig, type ServiceConditionConfig } from "../types/preparation";
import { mockAuth, roleLabels } from "../auth/mockAuth";
import type { Account } from "../auth/types";
import { useAuth } from "../auth/AuthContext";

import { AdminReviewAssignments } from '../components/AdminReviewAssignments';
type Draft = { service: ServiceDetail; savedAt: string };
type ServiceVersion = { service: ServiceDetail; preservedAt: string };
export function AdminPage() {
  const { mode } = useAuth();
  const { pathname } = useLocation();
  if (mode === 'api') return <ApiAdminWorkspace />;
  if (pathname === '/admin/bantuan') return <HelpPage />;
  if (pathname === '/admin') return <AdminOverviewPage />;
  if (pathname === '/admin/sumber') return <AdminSourcesPage />;
  if (pathname === '/admin/aktivitas') return <AdminActivityPage />;
  return <DemoAdminPage key={pathname} section={pathname === '/admin/petugas' ? 'petugas' : 'layanan'} />;
}
function DemoAdminPage({ section }: {section: 'layanan' | 'petugas'}) {
  const { services, user, adminRules, toggleRuleActive, addAdminRule, reviewQueue } = useApp();
  const [params,setParams]=useSearchParams();
  const allowedTabs=section==='layanan' ? [['layanan','Panduan layanan'],['aturan','Aturan pemeriksaan']] : [['akun','Akun'],['penugasan','Penugasan']];
  const tab=allowedTabs.some(([key])=>key===params.get('tab')) ? params.get('tab')! : allowedTabs[0][0];
  const setTab=(value:string)=>{const next=new URLSearchParams(params);next.set('tab',value);setParams(next);};
  const selectedId=Number(params.get('service'));
  const setSelectedId=(id:number)=>{const next=new URLSearchParams(params);next.set('service',String(id));setParams(next);};
  const [query, setQuery] = useState("");
  const drafts=useOperationStore('daftarin:guide-drafts:v1',EMPTY_DRAFTS);
  const versions=useOperationStore('daftarin:guide-versions:v1',EMPTY_VERSIONS);
  const [accounts, setAccounts] = useState<Account[]>(() =>
    mockAuth.listAccounts(),
  );
  const accountQuery=params.get('q')||'';
  const accountRole=['all','petugas','warga','admin'].includes(params.get('role')||'') ? params.get('role')! : 'petugas';
  const filteredAccounts=accounts.filter(account=>(accountRole==='all'||account.role===accountRole)&&[account.name,account.email].join(' ').toLowerCase().includes(accountQuery.toLowerCase()));
  const updateAccountFilter=(key:string,value:string)=>{const next=new URLSearchParams(params);next.set(key,value);setParams(next,{replace:key==='q'});};
  const [showCreate, setShowCreate] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [error, setError] = useState("");
  const log = (message: string) => {
    try { appendOperationAudit(message,user.name); }
    catch { setError('Riwayat perubahan belum tersimpan. Periksa ruang penyimpanan browser.'); }
  };
  const saveDraft = (service: ServiceDetail) => {
    const next = {
      ...drafts,
      [service.id]: {
        service,
        savedAt: new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        }),
      },
    };
    try {
      writeOperationStore("daftarin:guide-drafts:v1", next);
      log("Draf panduan disimpan: " + service.name);
      return true;
    } catch {
      setError("Draf belum tersimpan. Periksa ruang penyimpanan browser.");
      return false;
    }
  };
  const clearDraft = (id: number) => {
    const next = { ...drafts };
    delete next[id];
    try {
      writeOperationStore("daftarin:guide-drafts:v1", next);
    } catch {
      setError("Keterangan draf belum diperbarui.");
    }
  };
  const filtered = services.filter(service => (!params.get('draft') || Boolean(drafts[service.id])) && (service.name+' '+service.category).toLowerCase().includes(query.toLowerCase()));
  const selected = services.find(service=>service.id===selectedId) || filtered[0] || services[0];
  return (
    <WorkspaceLayout title={section === "layanan" ? "Layanan & persyaratan" : "Petugas & penugasan"}>
      <div className="workspace-tabs" role="tablist" aria-label="Pengelolaan">
        {allowedTabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            id={"admin-tab-" + key}
            role="tab"
            aria-selected={tab === key}
            tabIndex={tab === key ? 0 : -1}
            onKeyDown={(event) => {
              const keys = allowedTabs.map(([value])=>value);
              const index = keys.indexOf(key);
              const next =
                event.key === "ArrowRight"
                  ? keys[(index + 1) % keys.length]
                  : event.key === "ArrowLeft"
                    ? keys[(index + keys.length - 1) % keys.length]
                    : event.key === "Home"
                      ? keys[0]
                      : event.key === "End"
                        ? keys[keys.length - 1]
                        : null;
              if (next) {
                event.preventDefault();
                setTab(next);
                setError("");
                document.getElementById("admin-tab-" + next)?.focus();
              }
            }}
            aria-controls="admin-panel"
            onClick={() => {
              setTab(key);
              setError("");
            }}
          >
            {label}
          </button>
        ))}
      </div>
      {error && (
        <p className="form-error mb-5" role="alert">
          {error}
        </p>
      )}
      <div
        id="admin-panel"
        role="tabpanel"
        aria-labelledby={"admin-tab-" + tab}
      >
        {tab === 'penugasan' && <AdminReviewAssignments />}
        {tab === "layanan" && (
          <div className="admin-editor-grid">
            <section className="plain-panel service-index">
              <div className="form-field">
                <label htmlFor="admin-service-search">Cari layanan</label>
                <input
                  id="admin-service-search"
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              {params.get('draft')&&<div className="text-sm mb-3"><p>Menampilkan draf yang tersimpan.</p><button className="text-link min-h-[44px]" type="button" onClick={()=>{const next=new URLSearchParams(params);next.delete('draft');setParams(next);setQuery('');}}>Lihat semua layanan</button></div>}
              <div className="service-index-list">
                {filtered.map((service) => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => setSelectedId(service.id)}
                    aria-pressed={service.id === selected.id}
                  >
                    <strong>{service.name}</strong>
                    <small>
                      {drafts[service.id]
                        ? "Draf tersimpan"
                        : "Versi " + (service.version || 1)}
                    </small>
                  </button>
                ))}
                {!filtered.length && (
                  <p className="field-hint">Layanan tidak ditemukan.</p>
                )}
              </div>
            </section>
            {filtered.length > 0 && <GuideEditor
              key={selected.id}
              service={selected}
              draft={drafts[selected.id]}
              versions={versions.filter(
                (item) => item.service.id === selected.id,
              )}
              onSave={saveDraft}
              onPublished={(service) => {
                const next = [
                  { service: selected, preservedAt: new Date().toISOString() },
                  ...versions,
                ];
                try {
                  writeOperationStore("daftarin:guide-versions:v1", next);
                } catch {
                  throw new Error("Versi sebelumnya belum tersimpan. Panduan belum diterbitkan.");
                }
                clearDraft(service.id);
                log(
                  "Panduan diterbitkan: " +
                    service.name +
                    " · versi " +
                    service.version,
                );
              }}
            />}
          </div>
        )}
        {tab === "aturan" && (
          <section className="plain-panel">
            <div className="panel-heading">
              <div>
                <h2 className="panel-title">Aturan pemeriksaan</h2>
                <p className="field-hint">
                  Kelola acuan pemeriksaan untuk setiap layanan.
                </p>
              </div>
              <button
                className="button-secondary"
                onClick={() => setShowRule(!showRule)}
              >
                {showRule ? "Tutup formulir" : "Tambah aturan"}
              </button>
            </div>
            {showRule && (
              <RuleForm
                services={services}
                onSubmit={(rule) => {
                  addAdminRule(rule);
                  log("Aturan ditambahkan: " + rule.rule);
                  setShowRule(false);
                }}
              />
            )}
            <div
              className="table-scroll"
              role="region"
              aria-label="Tabel pengelolaan"
              tabIndex={0}
            >
              <table className="management-table">
                <thead>
                  <tr>
                    <th scope="col">Aturan</th>
                    <th scope="col">Layanan</th>
                    <th scope="col">Tindak lanjut</th>
                    <th scope="col">Digunakan</th>
                  </tr>
                </thead>
                <tbody>
                  {adminRules.map((rule) => (
                    <tr key={rule.id}>
                      <td>
                        <strong>{rule.rule}</strong>
                        <small>{rule.category}</small>
                      </td>
                      <td>{rule.service}</td>
                      <td>
                        {rule.severity === "Kritis"
                          ? "Perlu diperbaiki"
                          : rule.severity === "Peringatan"
                            ? "Perlu ditinjau"
                            : "Saran"}
                      </td>
                      <td>
                        <label className="rule-toggle">
                          <input
                            type="checkbox"
                            checked={rule.active}
                            onChange={() => {
                              toggleRuleActive(rule.id);
                              log(
                                (rule.active
                                  ? "Aturan dinonaktifkan: "
                                  : "Aturan diaktifkan: ") + rule.rule,
                              );
                            }}
                          />
                          <span>{rule.active ? "Ya" : "Tidak"}</span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
        {tab === "akun" && (
          <section className="plain-panel">
            <div className="panel-heading">
              <h2 className="panel-title">Akun pengguna</h2>
              <button
                className="button-secondary"
                onClick={() => setShowCreate(!showCreate)}
              >
                {showCreate ? "Tutup formulir" : "Tambah petugas"}
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_200px] mb-4"><div className="form-field"><label htmlFor="admin-account-query">Cari nama atau email akun</label><input id="admin-account-query" type="search" maxLength={160} value={accountQuery} onChange={event=>updateAccountFilter('q',event.target.value)} /></div><div className="form-field"><label htmlFor="admin-account-role">Peran akun</label><select id="admin-account-role" value={accountRole} onChange={event=>updateAccountFilter('role',event.target.value)}><option value="petugas">Petugas</option><option value="warga">Warga</option><option value="admin">Admin</option><option value="all">Semua akun</option></select></div></div>
            {showCreate && (
              <OfficerAccountForm
                onCreated={(account) => {
                  setAccounts((previous) => [...previous, account]);
                  setShowCreate(false);
                  log("Akun petugas dibuat: " + account.email);
                }}
              />
            )}
            <div
              className="table-scroll"
              role="region"
              aria-label="Tabel pengelolaan"
              tabIndex={0}
            >
              <table className="management-table">
                <thead>
                  <tr>
                    <th scope="col">Nama</th>
                    <th scope="col">Email</th>
                    <th scope="col">Peran</th>
                    <th scope="col">Tinjauan aktif</th>
                    <th scope="col">Akses petugas</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAccounts.map((account) => (
                    <tr key={account.id}>
                      <td>{account.name}</td>
                      <td>{account.email}</td>
                      <td>{roleLabels[account.role]}</td>
                      <td>{account.role==='petugas'?<Link className="text-link" to={'/admin/petugas?tab=penugasan&officer='+encodeURIComponent(account.id)}>{reviewQueue.filter(item=>item.assigned_officer_id===account.id&&!['SELESAI','HASIL_DITERIMA_WARGA','DITARIK'].includes(item.current_status)).length} permintaan →</Link>:'—'}</td>
                      <td>
                        {account.role === "petugas" ? (
                          <button
                            type="button"
                            className="text-link"
                            aria-label={
                              (account.active === false
                                ? "Aktifkan "
                                : "Nonaktifkan ") + account.name
                            }
                            onClick={() => {
                              try {
                                const assigned=reviewQueue.filter(item=>item.assigned_officer_id===account.id&&!['SELESAI','HASIL_DITERIMA_WARGA','DITARIK'].includes(item.current_status));
                                if(account.active!==false&&assigned.length) throw new Error(`Petugas masih menangani ${assigned.length} permintaan aktif. Pindahkan penugasan sebelum menonaktifkan akses.`);
                                mockAuth.setOfficerActive(
                                  account.id,
                                  account.active === false,
                                );
                                setAccounts(mockAuth.listAccounts());
                                log(
                                  (account.active === false
                                    ? "Akun petugas diaktifkan: "
                                    : "Akun petugas dinonaktifkan: ") +
                                    account.email,
                                );
                              } catch (cause) {
                                setError(
                                  cause instanceof Error
                                    ? cause.message
                                    : "Akses belum berhasil diperbarui.",
                                );
                              }
                            }}
                          >
                            {account.active === false
                              ? "Aktifkan"
                              : "Nonaktifkan"}
                          </button>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!filteredAccounts.length&&<p className="text-sm text-slate-600 mt-4">Tidak ada akun yang sesuai pencarian atau peran ini.</p>}
          </section>
        )}
      </div>
    </WorkspaceLayout>
  );
}
function GuideEditor({
  service,
  draft,
  versions,
  onSave,
  onPublished,
}: {
  service: ServiceDetail;
  draft?: Draft;
  versions: ServiceVersion[];
  onSave: (service: ServiceDetail) => boolean;
  onPublished: (service: ServiceDetail) => void;
}) {
  const { saveService, showToast, setServiceAvailability, user } = useApp();
  const [correctionReason,setCorrectionReason]=useState('');
  const [form, setForm] = useState(draft?.service || service);
  const [conditions,setConditions]=useState<ServiceConditionConfig>(()=>structuredClone(getServiceConditionConfig(draft?.service||service)));
  const [baseVersion,setBaseVersion]=useState(service.version||1);
  const [preview,setPreview]=useState<ServiceDetail|null>(null);
  const [requirements, setRequirements] = useState(
    (draft?.service || service).requirements.join("\n"),
  );
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState(draft?.savedAt || "");
  const update = (key: keyof ServiceDetail, value: string) => {
    setForm((previous) => ({ ...previous, [key]: value }));
    setSavedAt("");
  };
  const readForm = (): ServiceDetail => ({
    ...form,
    conditions,
    name: form.name.trim(),
    description: form.description.trim(),
    agency: form.agency.trim(),
    source_url: form.source_url?.trim(),
    requirements: requirements
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  });
  const validate = (next: ServiceDetail, publish: boolean) => {
    if (publish && (service.version||1)!==baseVersion) return 'Panduan telah berubah sejak editor dibuka. Simpan pekerjaan sebagai draf jika perlu, lalu muat versi terbaru.';
    if (
      !next.name ||
      !next.description ||
      !next.agency ||
      !next.requirements.length
    )
      return "Lengkapi nama layanan, deskripsi, instansi, dan setidaknya satu persyaratan.";
    if (publish) {
      if (!next.conditions?.question.trim() || !next.conditions.options.length) return 'Tambahkan pertanyaan dan minimal satu kondisi permohonan.';
      if (next.conditions.options.some(option=>!option.label.trim()||!option.requiredDocIndices.length||option.requiredDocIndices.some(index=>index<0||index>=next.requirements.length))) return 'Setiap kondisi perlu nama dan pilihan dokumen wajib yang masih tersedia. Periksa kembali kondisi setelah mengubah persyaratan.';
      try {
        const url = new URL(next.source_url || "");
        if (url.protocol !== "https:")
          return "Gunakan tautan sumber dengan https.";
      } catch {
        return "Tambahkan tautan sumber yang benar sebelum menerbitkan.";
      }
    }
    return "";
  };
  const save = () => {
    const next = readForm();
    const message = validate(next, false);
    setError(message);
    if (message) return;
    if (onSave(next)) {
      setSavedAt(
        new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }),
      );
      showToast("Draf panduan disimpan.");
    }
  };
  const publish = (event: FormEvent) => {
    event.preventDefault();
    const next = readForm();
    const message = validate(next,true);
    setError(message);
    if (!message) setPreview(next);
  };
  const confirmPublish = () => {
    if (!preview) return;
    const message=validate(preview,true);
    setError(message);
    if(message)return;
    const published: ServiceDetail = {...preview, availability:service.availability, availabilityNote:service.availabilityNote, version:baseVersion+1, published_at:new Date().toISOString(), source_verified:false, source_review_status:'perlu_ditinjau', source_review_version:baseVersion+1, source_review_by:undefined, reviewed_at:undefined, source_note:'Panduan versi baru memerlukan peninjauan ulang terhadap sumber sebelum dinyatakan sesuai.'};
    try { onPublished(published); saveService(published); setSavedAt(''); setBaseVersion(published.version!); setForm(published); setPreview(null); }
    catch(cause){setError(cause instanceof Error?cause.message:'Panduan belum diterbitkan.');}
  };
  return (
    <section className="plain-panel">
      <div className="panel-heading">
        <div>
          <h2 className="panel-title">Edit panduan</h2>
          <p className="field-hint">
            Versi terbit {service.version || 1}
            {savedAt ? " · Draf disimpan " + savedAt : ""}
          </p>
        </div>
      </div>
      <form className="auth-form" onSubmit={publish} onChangeCapture={()=>setPreview(null)} noValidate>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <div className="form-field">
          <label htmlFor="guide-name">Nama layanan</label>
          <input
            id="guide-name"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-agency">Instansi</label>
          <input
            id="guide-agency"
            value={form.agency}
            onChange={(event) => update("agency", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-description">Deskripsi</label>
          <textarea
            id="guide-description"
            rows={3}
            value={form.description}
            onChange={(event) => update("description", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-requirements">Persyaratan</label>
          <textarea
            id="guide-requirements"
            rows={6}
            value={requirements}
            onChange={(event) => {
              setRequirements(event.target.value);
              setSavedAt("");
            }}
          />
          <p className="field-hint">
            Tulis satu persyaratan pada setiap baris.
          </p>
        </div>
        <div className="form-field">
          <label htmlFor="guide-channel">Kanal layanan</label>
          <input
            id="guide-channel"
            value={form.official_channel}
            onChange={(event) => update("official_channel", event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="guide-source">Tautan sumber panduan</label>
          <input
            id="guide-source"
            type="url"
            placeholder="https://"
            value={form.source_url || ""}
            onChange={(event) => update("source_url", event.target.value)}
          />
          <p className="field-hint">
            Pastikan isi panduan sesuai sumber sebelum menerbitkan. Tautan tidak
            diperiksa otomatis.
          </p>
        </div>
        <details className="border-t border-slate-200 pt-3">
          <summary className="cursor-pointer min-h-[44px] py-2 font-medium">Kondisi pemohon & dokumen wajib</summary>
          <div className="form-field mt-3"><label htmlFor="guide-condition-question">Pertanyaan kondisi permohonan</label><input id="guide-condition-question" maxLength={250} value={conditions.question} onChange={event=>setConditions(previous=>({...previous,question:event.target.value}))} /></div>
          {conditions.options.map((option,optionIndex)=><fieldset key={option.value} className="border border-slate-200 rounded-lg p-3 mt-3"><legend className="px-1 text-sm font-medium">Kondisi {optionIndex+1}</legend>
            <div className="form-field"><label htmlFor={'condition-label-'+option.value}>Nama kondisi</label><input id={'condition-label-'+option.value} maxLength={250} value={option.label} onChange={event=>setConditions(previous=>({...previous,options:previous.options.map(item=>item.value===option.value?{...item,label:event.target.value}:item)}))} /></div>
            <div className="form-field mt-2"><label htmlFor={'condition-desc-'+option.value}>Penjelasan kondisi</label><textarea id={'condition-desc-'+option.value} rows={2} maxLength={1000} value={option.description} onChange={event=>setConditions(previous=>({...previous,options:previous.options.map(item=>item.value===option.value?{...item,description:event.target.value}:item)}))} /></div>
            <p className="text-sm font-medium mt-3">Dokumen wajib untuk kondisi ini</p>
            {requirements.split('\n').map(line=>line.trim()).filter(Boolean).map((requirement,index)=><label key={index} className="flex gap-3 items-start min-h-[44px] py-2 text-sm"><input type="checkbox" aria-label={'Wajib '+requirement+' untuk '+option.label} checked={option.requiredDocIndices.includes(index)} onChange={event=>setConditions(previous=>({...previous,options:previous.options.map(item=>item.value===option.value?{...item,requiredDocIndices:event.target.checked?[...new Set([...item.requiredDocIndices,index])]:item.requiredDocIndices.filter(value=>value!==index)}:item)}))} /><span>{requirement}</span></label>)}
            <button type="button" className="text-link min-h-[44px] text-sm" disabled={conditions.options.length===1} onClick={()=>setConditions(previous=>({...previous,options:previous.options.filter(item=>item.value!==option.value)}))}>Hapus kondisi ini</button>
          </fieldset>)}
          <button type="button" className="button-secondary mt-3" onClick={()=>setConditions(previous=>({...previous,options:[...previous.options,{value:'condition-'+crypto.randomUUID(),label:'',description:'',requiredDocIndices:[]}]}))}>Tambah kondisi pemohon</button>
        </details>
        {(service.version||1)!==baseVersion&&<div className="mt-3"><p className="text-sm">Ada versi panduan yang lebih baru.</p><button type="button" className="button-secondary mt-2" onClick={()=>{setForm(service);setRequirements(service.requirements.join('\n'));setConditions(structuredClone(getServiceConditionConfig(service)));setBaseVersion(service.version||1);setPreview(null);setError('');setSavedAt('');}}>Muat versi terbaru</button></div>}
        <div className="form-actions">
          <button type="button" className="button-secondary" onClick={save}>
            Simpan draf
          </button>
          <button type="submit" className="button-primary">
            Terbitkan panduan
          </button>
        </div>
      </form>
      {preview&&<section className="border-t border-slate-200 pt-4 mt-5" aria-label="Pratinjau publikasi">
        <h3 className="font-semibold">Tinjau sebelum menerbitkan versi {baseVersion+1}</h3>
        <p className="text-sm text-slate-600 mt-2">{preview.name} · {preview.agency}</p><p className="text-sm mt-2">{preview.description}</p>
        <ul className="list-disc pl-5 text-sm mt-3">{preview.requirements.map((requirement,index)=><li key={index}>{requirement}</li>)}</ul>
        {preview.conditions?.options.map(option=><p key={option.value} className="text-sm mt-3"><strong>{option.label}:</strong> {option.requiredDocIndices.map(index=>preview.requirements[index]).join('; ')}</p>)}
        <p className="text-sm text-slate-600 mt-3">Versi lama tetap disimpan. Sumber versi baru perlu ditinjau kembali oleh admin.</p>
        <div className="flex flex-wrap gap-3 mt-4"><button type="button" className="button-primary" onClick={confirmPublish}>Konfirmasi terbitkan panduan</button><button type="button" className="button-secondary" onClick={()=>setPreview(null)}>Kembali mengedit</button></div>
      </section>}
      <details className="border-t border-slate-200 mt-5 pt-3"><summary className="cursor-pointer min-h-[44px] font-medium">Jeda panduan atau pulihkan isi versi lama</summary><p className="text-sm mt-2">Jeda menghentikan persiapan baru dan pengiriman tinjauan. Riwayat tetap bisa dibaca; warga dapat mengikuti sumber resmi atau meminta bantuan.</p><div className="form-field mt-3"><label htmlFor="guide-correction-reason">Alasan koreksi atau pemulihan</label><textarea id="guide-correction-reason" rows={2} maxLength={1000} value={correctionReason} onChange={event=>setCorrectionReason(event.target.value)}/></div><button type="button" className="button-secondary mt-3" onClick={()=>{try{setServiceAvailability(service.id,service.availability!=='paused',correctionReason);appendOperationAudit((service.availability==='paused'?'Panduan diaktifkan kembali: ':'Panduan dijeda: ')+service.name+' · '+correctionReason,user.name);setError('');}catch(cause){setError(cause instanceof Error?cause.message:'Perubahan belum disimpan.');}}}>{service.availability==='paused'?'Aktifkan kembali persiapan':'Jeda persiapan layanan'}</button></details>
      {versions.length > 0 && (
        <details className="guide-version-history">
          <summary>Versi sebelumnya ({versions.length})</summary>
          {versions.map((item, index) => (
            <article key={item.preservedAt + "-" + index}>
              <button type="button" className="text-link min-h-[44px]" onClick={()=>{if(correctionReason.trim().length<10){setError('Isi alasan pemulihan minimal 10 karakter.');return;}if(!window.confirm('Muat isi versi lama ke draf? Perubahan yang belum disimpan pada editor akan diganti. Panduan publik belum berubah.'))return;const restored={...item.service,version:service.version};if(onSave(restored)){setForm(restored);setRequirements(restored.requirements.join('\n'));setConditions(structuredClone(getServiceConditionConfig(restored)));setBaseVersion(service.version||1);setPreview(null);appendOperationAudit(`Panduan versi ${item.service.version||1} dipulihkan ke draf: ${service.name} · ${correctionReason}`,user.name);showToast('Isi versi lama dimuat ke draf. Pratinjau dan terbitkan untuk membuat versi koreksi baru.');}}}>Pulihkan versi ini ke draf</button>
              <h3>
                Versi {item.service.version || 1} · {item.service.name}
              </h3>
              <p>{item.service.description}</p>
              <ul>
                {item.service.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
              {item.service.source_url && (
                <a
                  className="text-link"
                  href={item.service.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Sumber versi ini ↗
                </a>
              )}
            </article>
          ))}
        </details>
      )}
    </section>
  );
}
function RuleForm({
  services,
  onSubmit,
}: {
  services: ServiceDetail[];
  onSubmit: (rule: Omit<AdminRule, "id">) => void;
}) {
  const [text, setText] = useState("");
  const [service, setService] = useState("Semua layanan");
  const [severity, setSeverity] = useState<AdminRule["severity"]>("Peringatan");
  const [error, setError] = useState("");
  return (
    <form
      className="inline-editor auth-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!text.trim()) {
          setError("Tuliskan aturan pemeriksaan.");
          return;
        }
        onSubmit({
          service,
          category: "Kelengkapan",
          rule: text.trim(),
          version: "v1",
          active: true,
          severity,
        });
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="new-rule">Aturan pemeriksaan</label>
        <textarea
          id="new-rule"
          value={text}
          rows={3}
          onChange={(event) => setText(event.target.value)}
        />
      </div>
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="new-rule-service">Layanan</label>
          <select
            id="new-rule-service"
            value={service}
            onChange={(event) => setService(event.target.value)}
          >
            <option>Semua layanan</option>
            {services.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="form-field">
          <label htmlFor="new-rule-severity">Tindak lanjut</label>
          <select
            id="new-rule-severity"
            value={severity}
            onChange={(event) =>
              setSeverity(event.target.value as AdminRule["severity"])
            }
          >
            <option value="Kritis">Perlu diperbaiki</option>
            <option value="Peringatan">Perlu ditinjau</option>
            <option value="Rekomendasi">Saran</option>
          </select>
        </div>
      </div>
      <div>
        <button className="button-primary">Simpan aturan</button>
      </div>
    </form>
  );
}
function OfficerAccountForm({
  onCreated,
}: {
  onCreated: (account: Account) => void;
}) {
  const { showToast } = useApp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className="inline-editor auth-form"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setBusy(true);
        try {
          const account = await mockAuth.createOfficer({
            name,
            email,
            password,
          });
          onCreated(account);
          showToast("Akun petugas dibuat.");
        } catch (cause) {
          setError(
            cause instanceof Error
              ? cause.message
              : "Akun belum berhasil dibuat.",
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <div className="form-grid">
        <div className="form-field">
          <label htmlFor="officer-name">Nama petugas</label>
          <input
            id="officer-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>
        <div className="form-field">
          <label htmlFor="officer-email">Email petugas</label>
          <input
            id="officer-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
      </div>
      <PasswordField
        id="officer-password"
        label="Kata sandi awal"
        autoComplete="new-password"
        hint="Minimal 8 karakter. Akun dibuat di browser ini dan belum menerima email undangan."
        value={password}
        onChange={setPassword}
      />
      <div>
        <button className="button-primary" disabled={busy}>
          {busy ? "Membuat akun…" : "Buat akun petugas"}
        </button>
      </div>
    </form>
  );
}
