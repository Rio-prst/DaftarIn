import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppContextProvider } from './context/AppContext';
import { ToastContainer } from './components/ToastContainer';
import { ChatbotModal } from './components/ChatbotModal';
import { DemoToolbar } from './components/DemoToolbar';

// 12 Native React Pages
import { LandingPage } from './pages/LandingPage';
import { CatalogPage } from './pages/CatalogPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { PreparationDataPage } from './pages/PreparationDataPage';
import { PreparationDocsPage } from './pages/PreparationDocsPage';
import { PreparationInspectionPage } from './pages/PreparationInspectionPage';
import { PreparationSummaryPage } from './pages/PreparationSummaryPage';
import { TrackingPage } from './pages/TrackingPage';
import { OfficerPage } from './pages/OfficerPage';
import { AdminPage } from './pages/AdminPage';

export const App: React.FC = () => {
  return (
    <AppContextProvider>
      <HashRouter>
        <div className="min-h-screen bg-[#F5F7FB] text-[#172B45] font-sans antialiased selection:bg-[#1769D2] selection:text-white relative">
          <Routes>
            {/* 01. Landing Page Warga */}
            <Route path="/" element={<LandingPage />} />

            {/* 02. Katalog & Pencarian Layanan */}
            <Route path="/katalog" element={<CatalogPage />} />

            {/* 03. Panduan Persyaratan & Alur */}
            <Route path="/panduan" element={<ServiceDetailPage />} />
            <Route path="/layanan/:id" element={<ServiceDetailPage />} />

            {/* 04. Masuk Akun Simulasi */}
            <Route path="/masuk" element={<LoginPage />} />

            {/* 05. Dasbor Warga */}
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 06. Tahap 2: Formulir Data Pemohon */}
            <Route path="/persiapan/data" element={<PreparationDataPage />} />

            {/* 07. Tahap 3: Unggah Berkas Persyaratan */}
            <Route path="/persiapan/dokumen" element={<PreparationDocsPage />} />

            {/* 08. Tahap 4: Pemeriksaan AI Dokumen */}
            <Route path="/persiapan/pemeriksaan" element={<PreparationInspectionPage />} />

            {/* 09. Tahap 5: Ringkasan Kesiapan Berkas */}
            <Route path="/persiapan/ringkasan" element={<PreparationSummaryPage />} />

            {/* 10. Pelacakan Pengajuan (Linimasa) */}
            <Route path="/pelacakan" element={<TrackingPage />} />

            {/* 11. Meja Kerja Petugas Verifikasi */}
            <Route path="/petugas" element={<OfficerPage />} />

            {/* 12. Panel Kelola Panduan & Aturan AI */}
            <Route path="/admin" element={<AdminPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>

          {/* Global Floating Elements */}
          <ToastContainer />
          <ChatbotModal />
          <DemoToolbar />
        </div>
      </HashRouter>
    </AppContextProvider>
  );
};

export default App;
