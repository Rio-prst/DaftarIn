import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';

interface Message {
  sender: 'user' | 'bot';
  text: string;
  sources?: string[];
  time?: string;
}

const KNOWLEDGE_BASE: Array<{
  keywords: string[];
  reply: string;
  sources: string[];
}> = [
  {
    keywords: ['ejaan', 'nama', 'beda', 'huruf', 'chontoh', 'contoh', 'ktp fisik'],
    reply: 'Berdasarkan Pasal 58 UU No. 24/2013 tentang Administrasi Kependudukan, data identitas tunggal harus selaras antara fisik KTP-el dengan data SIAK Terpusat.\n\nJika terdapat perbedaan ejaan huruf (misalnya "Ayu Contoh" vs "Ayu Chontoh"):\n1. Pada tahap persiapan formulir ini, pastikan ejaan disamakan dengan KTP fisik Anda.\n2. Jika Anda ingin memperbaiki ejaan nama fisik KTP secara permanen, ajukan layanan "Pembetulan Biodata Kependudukan" dengan menyertakan Akta Kelahiran atau Ijazah legalisir sebagai dokumen acuan.',
    sources: ['Pasal 58 UU No. 24 Tahun 2013', 'Permendagri No. 108 Tahun 2019'],
  },
  {
    keywords: ['biaya', 'tarif', 'bayar', 'gratis', 'uang', 'calo'],
    reply: 'Seluruh pelayanan administrasi kependudukan (Pembaruan KK, KTP-el, Akta Kelahiran, KIA, Surat Pindah) di loket Disdukcapil berbiaya **GRATIS (Rp 0)**.\n\nHal ini ditegaskan secara mutlak dalam UU No. 24 Tahun 2013 Pasal 79A. Dilarang keras memberikan imbalan kepada siapapun di luar jalur resmi.',
    sources: ['Pasal 79A UU No. 24 Tahun 2013 tentang Adminduk'],
  },
  {
    keywords: ['barcode', 'qr', 'terpotong', 'foto', 'buram', 'kualitas', 'resolusi', 'scan'],
    reply: 'Barcode atau QR Code di pojok kanan bawah Kartu Keluarga merupakan **Tanda Tangan Elektronik (TTE)** tersertifikasi BSrE BSSN.\n\nPetugas loket akan memindai QR Code tersebut menggunakan laser scanner. Jika barcode terpotong atau buram akibat pantulan cahaya, dokumen fisik Anda berisiko ditolak di meja verifikasi. Sebaiknya ambil foto ulang dengan latar belakang kontras dan ke-4 sudut dokumen tampak utuh.',
    sources: ['Standar Digitalisasi Berkas Dukcapil RI', 'SOP Verifikasi SIAK Terpusat'],
  },
  {
    keywords: ['syarat', 'kk', 'kartu keluarga', 'persyaratan kk', 'ganti kk'],
    reply: 'Persyaratan resmi untuk Pembaruan Kartu Keluarga (KK):\n1. Formulir permohonan biodata (dihasilkan otomatis di portal ini).\n2. Kartu Keluarga (KK) asli yang lama.\n3. KTP-el Kepala Keluarga dan Pemohon.\n4. Buku Nikah / Akta Perkawinan (bila memperbarui status pernikahan).\n5. Surat Keterangan Lahir dari Bidan/RS (bila ada penambahan anak baru).\n\nSemua dokumen dapat dipersiapkan terlebih dahulu dan diperiksa mandiri di sistem ini.',
    sources: ['Permendagri No. 108/2019 Pasal 12', 'Portal Disdukcapil'],
  },
  {
    keywords: ['lama', 'waktu', 'durasi', 'proses', 'hari', 'estimasi'],
    reply: 'Standar waktu penyelesaian dokumen di Dinas Kependudukan dan Pencatatan Sipil:\n• Cetak KTP-el baru / penggantian: **1 Hari Kerja**\n• Pembaruan Kartu Keluarga: **1 - 2 Hari Kerja**\n• Penerbitan Akta Kelahiran: **2 - 3 Hari Kerja**\n• Surat Keterangan Pindah (SKPWNI): **1 - 3 Hari Kerja**\n\nAnda dapat memantau perkembangan proses secara real-time pada menu Pelacakan Pengajuan.',
    sources: ['Standar Pelayanan Publik Disdukcapil', 'Permendagri No. 19/2018'],
  },
  {
    keywords: ['pindah', 'domisili', 'skpwni', 'luar kota'],
    reply: 'Untuk pindah domisili, kini warga tidak lagi memerlukan surat pengantar dari RT/RW berdasarkan Perpres No. 96 Tahun 2018.\n\nAnda cukup membawa:\n1. Kartu Keluarga (KK) asli pemohon.\n2. KTP-el asli.\n3. Mengisi formulir alamat tujuan lengkap.\nPetugas akan langsung menerbitkan SKPWNI (Surat Keterangan Pindah WNI).',
    sources: ['Perpres No. 96 Tahun 2018 tentang Persyaratan dan Tata Cara Pendaftaran Penduduk'],
  },
];

export const ChatbotModal: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
}) => {
  const { isChatOpen, closeChat } = useApp();
  const isOpen = propIsOpen !== undefined ? propIsOpen : isChatOpen;
  const onClose = propOnClose || closeChat;

  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Halo Ayu Contoh! Saya **Mas Wowo**, asisten cerdas regulasi dan persiapan berkas kependudukan. Ada pertanyaan seputar persyaratan, temuan AI, atau alur pengajuan ke loket?',
      sources: ['Standar Pelayanan Adminduk JejakMasWowo'],
      time: 'Baru saja',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!isOpen) return null;

  const handleSendPrompt = (text: string) => {
    if (!text.trim() || isTyping) return;
    const userQuery = text.trim();
    setInput('');

    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userQuery, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
    ]);
    setIsTyping(true);

    setTimeout(() => {
      const lower = userQuery.toLowerCase();
      const matched = KNOWLEDGE_BASE.find(item =>
        item.keywords.some(kw => lower.includes(kw))
      );

      let botReply = '';
      let botSources: string[] = [];

      if (matched) {
        botReply = matched.reply;
        botSources = matched.sources;
      } else {
        botReply = `Pertanyaan Anda tentang "${userQuery}" telah dicocokkan dengan basis data regulasi kependudukan. Pastikan dokumen fisik Anda telah lengkap dan sesuai dengan petunjuk pada tahap persiapan berkas. Anda juga dapat menanyakan detail mengenai biaya resmi (Rp 0), standar durasi kerja, atau perbedaan ejaan nama.`;
        botSources = ['Pedoman Pelayanan Adminduk Ditjen Dukcapil Kemendagri'];
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          sources: botSources,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsTyping(false);
    }, 600);
  };

  const quickPrompts = [
    'Kenapa ejaan nama saya terdeteksi beda?',
    'Berapa biaya pengurusan KK?',
    'Kenapa barcode KK tidak boleh terpotong?',
    'Berapa lama proses pembuatan KTP?',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <div className="bg-white rounded-xl w-full max-w-[540px] shadow-2xl flex flex-col h-[620px] max-h-[90vh] overflow-hidden border border-[#DDE5EF]">
        {/* Header */}
        <div className="h-[68px] bg-[#142C4B] px-5 flex items-center justify-between text-white border-b border-[#233F66] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1769D2] flex items-center justify-center text-white shadow-md">
              <span className="material-symbols-outlined text-[22px]">smart_toy</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-[16px] leading-tight">Asisten Mas Wowo</h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-1.5 py-0.2 rounded font-semibold">
                  Online
                </span>
              </div>
              <p className="text-[12px] text-[#C8DCF5] mt-0.5">Pendamping Persyaratan & Regulasi Publik</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#F5F7FB]">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-[14px] leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-[#1769D2] text-white rounded-br-none'
                    : 'bg-white text-[#172B45] border border-[#DDE5EF] rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>

                {m.sources && m.sources.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-[#DDE5EF] text-[11px] text-[#52657A]">
                    <span className="font-bold text-[#142C4B] block mb-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#1769D2]">verified</span>
                      Rujukan Regulasi Resmi:
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {m.sources.map((s, idx) => (
                        <li key={idx} className="text-[#52657A]">{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {m.time && (
                  <div className={`text-[10px] mt-1.5 text-right ${m.sender === 'user' ? 'text-white/70' : 'text-[#74777E]'}`}>
                    {m.time}
                  </div>
                )}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-[#52657A] text-[12px] bg-white p-3 rounded-xl border border-[#DDE5EF] w-max shadow-sm">
              <span className="animate-spin material-symbols-outlined text-[16px] text-[#1769D2]">
                progress_activity
              </span>
              <span>Mas Wowo sedang menelaah pasal & regulasi adminduk...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2.5 bg-white border-t border-[#DDE5EF] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(p)}
              className="whitespace-nowrap px-2.5 py-1 bg-[#F5F7FB] hover:bg-[#E7F0FF] text-[#1769D2] hover:text-[#1256AE] border border-[#DDE5EF] rounded-full text-[11px] font-medium transition-colors shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendPrompt(input);
          }}
          className="p-3 bg-white border-t border-[#DDE5EF] flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tanyakan regulasi, beda huruf nama, biaya loket..."
            className="flex-1 px-3.5 py-2 text-[13px] border border-[#DDE5EF] rounded-lg focus:outline-none focus:border-[#1769D2] text-[#172B45]"
          />
          <button
            type="submit"
            disabled={isTyping || !input.trim()}
            className="px-4 py-2 bg-[#1769D2] hover:bg-[#1256AE] disabled:opacity-40 text-white font-semibold rounded-lg text-[13px] transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            <span>Kirim</span>
            <span className="material-symbols-outlined text-[16px]">send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
