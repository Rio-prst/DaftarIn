import type { ApplicationRecord } from '../context/AppContext';
import { OFFICER_ITEM_VERDICT_LABELS } from '../types/preparation';
import { FamilyContext } from './FamilyContext';

export function SubmissionReviewHistory({ record, initialVersion }: { record: ApplicationRecord; initialVersion?: number }) {
  const snapshots = record.submission_history?.length ? record.submission_history : record.submitted_snapshot ? [record.submitted_snapshot] : [];
  const evaluations = record.evaluation_history?.length ? record.evaluation_history : record.latest_evaluation ? [record.latest_evaluation] : [];
  if (!snapshots.length && !evaluations.length) return null;
  return <section className="case-section mt-6" aria-label="Riwayat kiriman dan penilaian">
    <h2 className="panel-title">Riwayat kiriman dan penilaian</h2>
    {snapshots.map(snapshot => <details key={snapshot.submissionVersion} open={snapshot.submissionVersion === initialVersion || undefined} className="border-b border-slate-200 py-3">
      <summary className="cursor-pointer min-h-[44px] py-2 font-medium">Kiriman #{snapshot.submissionVersion} · {snapshot.submittedAt}</summary>
      <div className="space-y-3 py-3 text-sm">
        <p>{snapshot.conditionLabel}{snapshot.serviceSnapshot?.version ? ` · Acuan panduan v${snapshot.serviceSnapshot.version}` : ''}</p>
        <FamilyContext member={snapshot.familyMember} birth={record.service_id === 3} />
        <dl className="grid gap-3 sm:grid-cols-2">
          {Object.entries({Nama: snapshot.formData.nama_lengkap, NIK: snapshot.formData.nik, 'Nomor KK': snapshot.formData.no_kk, Alamat: snapshot.formData.alamat, 'Rincian permohonan': snapshot.formData.alasan}).map(([label,value]) => <div key={label}><dt className="text-slate-500">{label}</dt><dd className="break-words">{value || 'Belum dicantumkan'}</dd></div>)}
        </dl>
        {snapshot.citizenNote && <p><strong>Catatan warga:</strong> {snapshot.citizenNote}</p>}
        {!!snapshot.changesSummary?.length && <p><strong>Perubahan:</strong> {snapshot.changesSummary.join('; ')}</p>}
        {!evaluations.some(item => item.submissionVersion === snapshot.submissionVersion) && <p className="text-slate-600">Belum ada keputusan petugas untuk versi kiriman ini.</p>}
        {evaluations.filter(item => item.submissionVersion === snapshot.submissionVersion).map((evaluation,index) => <div key={index} className="border-l-2 border-slate-200 pl-3 space-y-2">
          <p className="font-medium">{evaluation.decision === 'SELESAI' ? 'Tinjauan awal selesai' : 'Perlu perbaikan'} · {evaluation.evaluatedBy}</p>
          <p className="text-slate-500">{evaluation.evaluatedAt}</p>
          <p>{evaluation.summaryNote}</p>
          {evaluation.revisionDetail && <p><strong>Tindakan:</strong> {evaluation.revisionDetail.requiredAction}</p>}
          <ul className="space-y-2">{evaluation.itemAssessments.map(item => <li key={item.itemId}>
            <p>{item.itemName}{item.fileVersion ? ` (v${item.fileVersion})` : ''}: <strong>{OFFICER_ITEM_VERDICT_LABELS[item.verdict]}</strong></p>
            {item.note && <p className="text-slate-600 mt-1">{item.note}</p>}
          </li>)}</ul>
        </div>)}
      </div>
    </details>)}
  </section>;
}
