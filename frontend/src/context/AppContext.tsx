import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  role: 'warga' | 'petugas' | 'admin';
  email: string;
  nik: string;
}

export interface ServiceDetail {
  id: number;
  slug: string;
  name: string;
  category: string;
  agency: string;
  description: string;
  official_fee: string;
  official_duration: string;
  official_channel: string;
  requirements: string[];
  is_popular?: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  fileName: string;
  size: string;
  status: 'TERUNGGAH' | 'BELUM';
  required: boolean;
  fileType: 'image' | 'pdf';
  previewUrl?: string;
}

export interface InspectionFinding {
  id: string;
  category: 'Konsistensi Data' | 'Kualitas Berkas' | 'Legalitas';
  title: string;
  evidence: string;
  rule: string;
  action: string;
  severity: 'warning' | 'error' | 'info';
  resolved: boolean;
  docTarget: string;
}

export interface TimelineEvent {
  id: number;
  status: 'DITERIMA' | 'VERIFIKASI' | 'PERLU_PERBAIKAN' | 'DIPROSES' | 'SELESAI';
  title: string;
  time: string;
  source: string;
  notes: string;
  completed: boolean;
  current?: boolean;
}

export interface ApplicationRecord {
  id: string;
  official_number: string;
  service_id: number;
  service_name: string;
  channel: string;
  applicant_name: string;
  applicant_nik: string;
  current_status: 'DITERIMA' | 'VERIFIKASI' | 'PERLU_PERBAIKAN' | 'DIPROSES' | 'SELESAI';
  created_at: string;
  events: TimelineEvent[];
}

export interface AdminRule {
  id: string;
  service: string;
  category: string;
  rule: string;
  version: string;
  active: boolean;
  severity: 'Kritis' | 'Peringatan' | 'Rekomendasi';
}

export interface ToastNotice {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export const DEFAULT_SERVICES: ServiceDetail[] = [
  {
    id: 1,
    slug: 'pembaruan-kartu-keluarga',
    name: 'Pembaruan Data Kartu Keluarga (KK)',
    category: 'Kependudukan',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Layanan perubahan susunan keluarga, perubahan status perkawinan, penambahan anggota, atau pembetulan elemen biodata.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '1-2 Hari Kerja',
    official_channel: 'Loket Disdukcapil / Portal Warga',
    requirements: [
      'Kartu Keluarga (KK) Asli Lama',
      'KTP-el Kepala Keluarga & Pemohon',
      'Buku Nikah / Akta Perkawinan (jika status kawin)',
      'Surat Keterangan Lahir / Kematian (jika ada mutasi)',
    ],
    is_popular: true,
  },
  {
    id: 2,
    slug: 'ktp-el-baru-penggantian',
    name: 'Penerbitan KTP-el Baru / Penggantian Rusak',
    category: 'Identitas',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Cetak fisik KTP-el karena rusak, hilang, perubahan elemen data, atau perekaman pemula usia 17 tahun.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '1 Hari Kerja',
    official_channel: 'Kantor Kecamatan / Loket Terpadu Disdukcapil',
    requirements: [
      'Fotokopi Kartu Keluarga Terbaru',
      'KTP-el Fisik Rusak (atau Surat Kehilangan Polisi jika hilang)',
      'Pas Foto Resmi Latar Biru/Merah',
    ],
    is_popular: true,
  },
  {
    id: 3,
    slug: 'akta-kelahiran',
    name: 'Penerbitan Akta Kelahiran Baru',
    category: 'Pencatatan Sipil',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Pencatatan peristiwa kelahiran anak dalam 60 hari pertama untuk penerbitan kutipan akta resmi.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '2-3 Hari Kerja',
    official_channel: 'Loket Faskes / RSUD / Disdukcapil',
    requirements: [
      'Surat Keterangan Lahir dari Dokter / Bidan / Faskes',
      'Buku Nikah / Akta Perkawinan Orang Tua',
      'KTP-el Kedua Orang Tua & 2 Orang Saksi',
      'Kartu Keluarga Orang Tua',
    ],
    is_popular: true,
  },
  {
    id: 4,
    slug: 'surat-pindah-skpwni',
    name: 'Surat Keterangan Pindah Datang (SKPWNI)',
    category: 'Kependudukan',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Layanan administrasi perpindahan domisili kependudukan antar kelurahan, kecamatan, atau antar provinsi.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '1-3 Hari Kerja',
    official_channel: 'Portal Online / Loket Pelayanan Adminduk',
    requirements: [
      'Kartu Keluarga (KK) Asli Pemohon',
      'KTP-el Pemohon yang Pindah',
      'Alamat Tujuan Lengkap Termasuk Kode Pos',
    ],
    is_popular: false,
  },
  {
    id: 5,
    slug: 'kartu-identitas-anak-kia',
    name: 'Penerbitan Kartu Identitas Anak (KIA)',
    category: 'Identitas',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Identitas resmi anak usia 0 hingga kurang dari 17 tahun untuk perlindungan hak konstitusional anak.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '1 Hari Kerja',
    official_channel: 'Loket Disdukcapil / Kecamatan',
    requirements: [
      'Fotokopi Akta Kelahiran Anak',
      'Kartu Keluarga Orang Tua',
      'KTP-el Kedua Orang Tua',
      'Pas Foto 2x3 (untuk anak usia di atas 5 tahun)',
    ],
    is_popular: false,
  },
  {
    id: 6,
    slug: 'akta-kematian',
    name: 'Pencatatan & Penerbitan Akta Kematian',
    category: 'Pencatatan Sipil',
    agency: 'Dinas Kependudukan dan Pencatatan Sipil',
    description: 'Pencatatan peristiwa kematian warga negara untuk pemutakhiran data kependudukan dan penetapan waris.',
    official_fee: 'Gratis (Rp 0)',
    official_duration: '1-2 Hari Kerja',
    official_channel: 'Loket Disdukcapil Kota',
    requirements: [
      'Surat Kematian dari Dokter / Rumah Sakit / Kelurahan',
      'KTP-el & KK Jenazah Asli',
      'KTP-el Pelapor & 2 Orang Saksi',
    ],
    is_popular: false,
  },
];

interface AppContextType {
  user: UserProfile;
  setUserRole: (role: 'warga' | 'petugas' | 'admin') => void;
  selectedService: ServiceDetail;
  setSelectedService: (service: ServiceDetail) => void;
  formData: {
    nama_lengkap: string;
    nik: string;
    no_kk: string;
    telepon: string;
    alamat: string;
    alasan: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    nama_lengkap: string;
    nik: string;
    no_kk: string;
    telepon: string;
    alamat: string;
    alasan: string;
  }>>;
  loadDemoFormData: () => void;
  documents: DocumentItem[];
  addDocument: (doc: DocumentItem) => void;
  removeDocument: (id: string) => void;
  updateDocumentStatus: (id: string, status: 'TERUNGGAH' | 'BELUM') => void;
  inspections: InspectionFinding[];
  toggleResolveFinding: (id: string) => void;
  readinessScore: number;
  aiScanning: boolean;
  runAIScanSimulation: () => void;
  applications: ApplicationRecord[];
  addApplication: (app: ApplicationRecord) => void;
  advanceApplicationStatus: (appId: string) => void;
  officerUpdateApplication: (appId: string, newStatus: TimelineEvent['status'], note: string) => void;
  addCitizenNote: (appId: string, note: string) => void;
  adminRules: AdminRule[];
  toggleRuleActive: (ruleId: string) => void;
  addAdminRule: (rule: Omit<AdminRule, 'id'>) => void;
  isChatOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toasts: ToastNotice[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current logged in user
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jmw_user');
    return saved ? JSON.parse(saved) : {
      name: 'Ayu Contoh',
      role: 'warga',
      email: 'ayu.contoh@warga.id',
      nik: '3275012345670001',
    };
  });

  const setUserRole = (role: 'warga' | 'petugas' | 'admin') => {
    let updated: UserProfile;
    if (role === 'warga') {
      updated = { name: 'Ayu Contoh', role: 'warga', email: 'ayu.contoh@warga.id', nik: '3275012345670001' };
    } else if (role === 'petugas') {
      updated = { name: 'Budi Santoso', role: 'petugas', email: 'budi.petugas@disdukcapil.go.id', nik: '3275001980051201' };
    } else {
      updated = { name: 'Admin Utama', role: 'admin', email: 'admin@jejakmaswowo.id', nik: '3275000000000001' };
    }
    setUser(updated);
    localStorage.setItem('jmw_user', JSON.stringify(updated));
    showToast(`Beralih peran sebagai: ${updated.name} (${role.toUpperCase()})`, 'info');
  };

  // Selected Service
  const [selectedService, setSelectedServiceState] = useState<ServiceDetail>(() => {
    const saved = localStorage.getItem('jmw_service');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES[0];
  });

  const setSelectedService = (service: ServiceDetail) => {
    setSelectedServiceState(service);
    localStorage.setItem('jmw_service', JSON.stringify(service));
  };

  // Form Data (Tahap 2)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('jmw_form_data');
    return saved ? JSON.parse(saved) : {
      nama_lengkap: 'Ayu Contoh',
      nik: '3275012345670001',
      no_kk: '3275019876540002',
      telepon: '081234567890',
      alamat: 'Jl. Mawar No. 12, RT 02/RW 05, Kelurahan Jatiwaringin, Kota Bekasi',
      alasan: 'Pembaruan data status perkawinan dan penambahan anggota keluarga baru.',
    };
  });

  useEffect(() => {
    localStorage.setItem('jmw_form_data', JSON.stringify(formData));
  }, [formData]);

  const loadDemoFormData = () => {
    setFormData({
      nama_lengkap: 'Ayu Contoh',
      nik: '3275012345670001',
      no_kk: '3275019876540002',
      telepon: '081234567890',
      alamat: 'Jl. Mawar No. 12, RT 02/RW 05, Kelurahan Jatiwaringin, Kota Bekasi',
      alasan: 'Pembaruan data status perkawinan dan penambahan anggota keluarga baru.',
    });
    showToast('Data pemohon berhasil diselaraskan dengan contoh resmi!', 'success');
  };

  // Documents (Tahap 3)
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('jmw_documents');
    return saved ? JSON.parse(saved) : [
      {
        id: 'ktp',
        name: 'KTP-el Asli Pemohon',
        fileName: 'ktp_ayu_chontoh_scan.png',
        size: '245 KB',
        status: 'TERUNGGAH',
        required: true,
        fileType: 'image',
      },
      {
        id: 'kk',
        name: 'Kartu Keluarga (KK) Lama',
        fileName: 'kartu_keluarga_3275.pdf',
        size: '512 KB',
        status: 'TERUNGGAH',
        required: true,
        fileType: 'pdf',
      },
      {
        id: 'nikah',
        name: 'Buku Nikah / Akta Perkawinan',
        fileName: 'buku_nikah_resmi.pdf',
        size: '1.2 MB',
        status: 'TERUNGGAH',
        required: false,
        fileType: 'pdf',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmw_documents', JSON.stringify(documents));
  }, [documents]);

  const addDocument = (doc: DocumentItem) => {
    setDocuments(prev => [...prev.filter(d => d.id !== doc.id), doc]);
    showToast(`Berkas '${doc.name}' berhasil diunggah!`, 'success');
  };

  const removeDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    showToast('Dokumen dihapus dari draf.', 'info');
  };

  const updateDocumentStatus = (id: string, status: 'TERUNGGAH' | 'BELUM') => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  // AI Inspection Findings (Tahap 4)
  const [inspections, setInspections] = useState<InspectionFinding[]>(() => {
    const saved = localStorage.getItem('jmw_inspections');
    return saved ? JSON.parse(saved) : [
      {
        id: 'find-1',
        category: 'Konsistensi Data',
        title: 'Perbedaan Huruf Ejaan Nama',
        evidence: "Formulir tertulis 'Ayu Contoh', sedangkan pada scan KTP fisik terdeteksi OCR 'AYU CHONTOH'.",
        rule: 'Pasal 58 UU No. 24/2013 tentang Administrasi Kependudukan',
        action: 'Pastikan ejaan nama pada formulir diselaraskan atau sertakan akta kelahiran jika terdapat revisi resmi.',
        severity: 'warning',
        resolved: false,
        docTarget: 'ktp',
      },
      {
        id: 'find-2',
        category: 'Kualitas Berkas',
        title: 'Pojok Barcode Dokumen Terpotong',
        evidence: 'Area QR Code / Tanda Tangan Elektronik pada Kartu Keluarga terpotong batas tepi kamera.',
        rule: 'Standar Arsip Digital Permendagri No. 108/2019',
        action: 'Disarankan scan ulang Kartu Keluarga dengan ke-4 sudut dokumen tampak utuh dan pencahayaan merata.',
        severity: 'warning',
        resolved: false,
        docTarget: 'kk',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmw_inspections', JSON.stringify(inspections));
  }, [inspections]);

  const toggleResolveFinding = (id: string) => {
    setInspections(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextState = !item.resolved;
          showToast(
            nextState
              ? `Temuan '${item.title}' ditandai selesai!`
              : `Temuan '${item.title}' ditandai perlu perhatian.`,
            nextState ? 'success' : 'info'
          );
          return { ...item, resolved: nextState };
        }
        return item;
      })
    );
  };

  // Dynamic Readiness Score calculation
  const totalFindings = inspections.length;
  const resolvedFindings = inspections.filter(f => f.resolved).length;
  const readinessScore = totalFindings === 0 ? 100 : Math.round(72 + (resolvedFindings / totalFindings) * 26);

  // AI Scan Simulation
  const [aiScanning, setAiScanning] = useState(false);
  const runAIScanSimulation = () => {
    setAiScanning(true);
    showToast('AI Inspector sedang memindai berkas terhadap regulasi SIAK...', 'info');
    setTimeout(() => {
      setAiScanning(false);
      showToast('Pemeriksaan AI selesai! 2 catatan perhatian diperbarui.', 'success');
    }, 1800);
  };

  // Applications Tracking (Linimasa)
  const [applications, setApplications] = useState<ApplicationRecord[]>(() => {
    const saved = localStorage.getItem('jmw_applications');
    return saved ? JSON.parse(saved) : [
      {
        id: 'JMW-REG-20261028-984',
        official_number: 'DISDUKCAPIL-BKS-2026-8812',
        service_id: 1,
        service_name: 'Pembaruan Data Kartu Keluarga (KK)',
        channel: 'Loket Disdukcapil Kota Bekasi',
        applicant_name: 'Ayu Contoh',
        applicant_nik: '3275012345670001',
        current_status: 'VERIFIKASI',
        created_at: '28 Oktober 2026, 09:30 WIB',
        events: [
          {
            id: 1,
            status: 'DITERIMA',
            title: 'Permohonan Diterima di Loket Pelayanan',
            time: '28 Oktober 2026, 09:30 WIB',
            source: 'Petugas Loket Disdukcapil (Meja 3)',
            notes: 'Berkas permohonan fisik Kartu Keluarga diterima lengkap. Nomor registrasi resmi diterbitkan.',
            completed: true,
          },
          {
            id: 2,
            status: 'VERIFIKASI',
            title: 'Pemeriksaan Kesesuaian Biodata SIAK Terpusat',
            time: '28 Oktober 2026, 11:15 WIB',
            source: 'Petugas Verifikator (Budi Santoso)',
            notes: 'Verifikasi keselarasan NIK pemohon dan data pernikahan di database nasional SIAK.',
            completed: true,
            current: true,
          },
          {
            id: 3,
            status: 'DIPROSES',
            title: 'Pencetakan Blanko & Tanda Tangan Elektronik (TTE)',
            time: 'Estimasi: 29 Oktober 2026, 10:00 WIB',
            source: 'Sistem Terintegrasi Dukcapil',
            notes: 'Proses generate barcode sertifikasi TTE oleh Kepala Dinas Kependudukan.',
            completed: false,
          },
          {
            id: 4,
            status: 'SELESAI',
            title: 'Kartu Keluarga Baru Siap Diambil / Diunduh',
            time: 'Estimasi: 29 Oktober 2026, 15:00 WIB',
            source: 'Loket Pengambilan Dokumen',
            notes: 'Dokumen PDF dikirim ke email terdaftar dan fisik dapat diambil di loket.',
            completed: false,
          },
        ],
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmw_applications', JSON.stringify(applications));
  }, [applications]);

  const addApplication = (app: ApplicationRecord) => {
    setApplications(prev => [app, ...prev]);
    showToast(`Pengajuan ${app.official_number} berhasil didaftarkan ke sistem pelacakan!`, 'success');
  };

  const advanceApplicationStatus = (appId: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const currentIdx = app.events.findIndex(e => e.current);
        if (currentIdx === -1 || currentIdx >= app.events.length - 1) {
          showToast('Permohonan sudah pada status tahap akhir (SELESAI).', 'info');
          return app;
        }

        const nextIdx = currentIdx + 1;
        const updatedEvents = app.events.map((e, idx) => ({
          ...e,
          completed: idx <= nextIdx,
          current: idx === nextIdx,
          time: idx === nextIdx ? 'Hari ini, Baru saja' : e.time,
        }));

        const newStatus = updatedEvents[nextIdx].status;
        showToast(`Status permohonan berhasil dimajukan ke: ${newStatus}`, 'success');

        return {
          ...app,
          current_status: newStatus,
          events: updatedEvents,
        };
      })
    );
  };

  const officerUpdateApplication = (appId: string, newStatus: TimelineEvent['status'], note: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const targetEventIdx = app.events.findIndex(e => e.status === newStatus);

        let updatedEvents: TimelineEvent[];
        if (targetEventIdx !== -1) {
          updatedEvents = app.events.map((e, idx) => ({
            ...e,
            completed: idx <= targetEventIdx,
            current: idx === targetEventIdx,
            notes: idx === targetEventIdx ? note : e.notes,
            time: idx === targetEventIdx ? '28 Oktober 2026 (Diperbarui Petugas)' : e.time,
          }));
        } else {
          updatedEvents = [
            ...app.events,
            {
              id: app.events.length + 1,
              status: newStatus,
              title: `Pembaruan Khusus Petugas: ${newStatus}`,
              time: 'Baru saja',
              source: `Petugas Verifikator (${user.name})`,
              notes: note,
              completed: true,
              current: true,
            },
          ];
        }

        showToast(`Status permohonan ${app.official_number} berhasil diubah menjadi ${newStatus}!`, 'success');
        return {
          ...app,
          current_status: newStatus,
          events: updatedEvents,
        };
      })
    );
  };

  const addCitizenNote = (appId: string, note: string) => {
    setApplications(prev =>
      prev.map(app => {
        if (app.id !== appId) return app;
        const noteEvent: TimelineEvent = {
          id: app.events.length + 1,
          status: app.current_status,
          title: 'Catatan Konfirmasi Warga',
          time: 'Baru saja',
          source: `Catatan Warga (${user.name})`,
          notes: note,
          completed: true,
          current: false,
        };
        showToast('Catatan warga berhasil ditambahkan pada linimasa!', 'success');
        return {
          ...app,
          events: [...app.events, noteEvent],
        };
      })
    );
  };

  // Admin Rules
  const [adminRules, setAdminRules] = useState<AdminRule[]>(() => {
    const saved = localStorage.getItem('jmw_admin_rules');
    return saved ? JSON.parse(saved) : [
      {
        id: 'RULE-ADM-01',
        service: 'Semua Layanan',
        category: 'Konsistensi Data',
        rule: 'Ejaan Nama Formulir harus sama persis dengan KTP fisik pemohon (Fuzzy Tolerance: 90%).',
        version: 'v2.1',
        active: true,
        severity: 'Kritis',
      },
      {
        id: 'RULE-ADM-02',
        service: 'Semua Layanan',
        category: 'Kualitas Berkas',
        rule: 'Resolusi scan/foto minimal 150 DPI dan seluruh 4 sudut tampak jelas tanpa glare berlebih.',
        version: 'v1.4',
        active: true,
        severity: 'Peringatan',
      },
      {
        id: 'RULE-ADM-03',
        service: 'Pembaruan KK',
        category: 'Legalitas',
        rule: 'Kartu Keluarga wajib menyertakan barcode QR code TTE Dukcapil yang valid.',
        version: 'v2.0',
        active: true,
        severity: 'Kritis',
      },
      {
        id: 'RULE-ADM-04',
        service: 'Akta Kelahiran',
        category: 'Kelengkapan',
        rule: 'Wajib menyertakan Surat Keterangan Lahir resmi dari Faskes / Bidan berizin.',
        version: 'v1.0',
        active: true,
        severity: 'Kritis',
      },
      {
        id: 'RULE-ADM-05',
        service: 'Pindah Datang',
        category: 'Validasi Wilayah',
        rule: 'Surat Pindah wajib mencantumkan kode wilayah tujuan 10 digit Kemendagri.',
        version: 'v1.2',
        active: false,
        severity: 'Rekomendasi',
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem('jmw_admin_rules', JSON.stringify(adminRules));
  }, [adminRules]);

  const toggleRuleActive = (ruleId: string) => {
    setAdminRules(prev =>
      prev.map(r => {
        if (r.id === ruleId) {
          const next = !r.active;
          showToast(`Aturan ${r.id} sekarang ${next ? 'AKTIF' : 'NONAKTIF'}.`, next ? 'success' : 'warning');
          return { ...r, active: next };
        }
        return r;
      })
    );
  };

  const addAdminRule = (newRule: Omit<AdminRule, 'id'>) => {
    const id = `RULE-ADM-0${adminRules.length + 1}`;
    setAdminRules(prev => [...prev, { ...newRule, id }]);
    showToast(`Aturan baru ${id} berhasil ditambahkan!`, 'success');
  };

  // Chatbot Modal state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const openChat = () => setIsChatOpen(true);
  const closeChat = () => setIsChatOpen(false);

  // Toast Notification System
  const [toasts, setToasts] = useState<ToastNotice[]>([]);
  const showToast = (message: string, type: ToastNotice['type'] = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUserRole,
        selectedService,
        setSelectedService,
        formData,
        setFormData,
        loadDemoFormData,
        documents,
        addDocument,
        removeDocument,
        updateDocumentStatus,
        inspections,
        toggleResolveFinding,
        readinessScore,
        aiScanning,
        runAIScanSimulation,
        applications,
        addApplication,
        advanceApplicationStatus,
        officerUpdateApplication,
        addCitizenNote,
        adminRules,
        toggleRuleActive,
        addAdminRule,
        isChatOpen,
        openChat,
        closeChat,
        toasts,
        showToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppContextProvider');
  }
  return context;
};
