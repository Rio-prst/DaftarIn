import { ApiCatalog, ApiCitizenHome, ApiPreparation, ApiTrackingDetail, ApiOfficialEntry, ApiOfficer } from "./pages/ApiWorkspace";
import { HelpPage } from './pages/HelpPage';
import { DemoGuide } from './components/DemoGuide';
import { ConnectionNotice } from './components/ConnectionNotice';
import { lazy, Suspense } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { UserPreferencesProvider } from "./preferences/UserPreferencesProvider";
import { RequireAuth } from "./auth/RequireAuth";
import { AppContextProvider } from "./context/AppContext";
import { ToastContainer } from "./components/ToastContainer";
import { ChatbotModal } from "./components/ChatbotModal";
import { FloatingAiButton } from "./components/FloatingAiButton";
import { RouteFocus } from "./components/RouteFocus";
import { LandingPage } from "./pages/LandingPage";
import { CatalogPage } from "./pages/CatalogPage";
import { ServiceDetailPage } from "./pages/ServiceDetailPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { PasswordRecoveryPage } from "./pages/PasswordRecoveryPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { AccountPage } from "./pages/AccountPage";
import { AccessDeniedPage, NotFoundPage } from "./pages/AccessDeniedPage";
import { DashboardPage } from "./pages/DashboardPage";
import { PreparationListPage } from "./pages/PreparationListPage";
import { PreparationNeedPage } from "./pages/PreparationNeedPage";
import { PreparationDataPage } from "./pages/PreparationDataPage";
import { PreparationDocsPage } from "./pages/PreparationDocsPage";
import { PreparationInspectionPage } from "./pages/PreparationInspectionPage";
import { PreparationSummaryPage } from "./pages/PreparationSummaryPage";
import { TrackingPage } from "./pages/TrackingPage";
import { NeedsPage } from "./pages/NeedsPage";
import { FamilyPage } from "./pages/FamilyPage";

const OfficerPage=lazy(()=>import('./pages/OfficerPage').then(module=>({default:module.OfficerPage})));
const AdminPage=lazy(()=>import('./pages/AdminPage').then(module=>({default:module.AdminPage})));
const OfficerOverviewPage=lazy(()=>import('./pages/OfficerWorkspacePage').then(module=>({default:module.OfficerOverviewPage})));
const OfficerHistoryPage=lazy(()=>import('./pages/OfficerWorkspacePage').then(module=>({default:module.OfficerHistoryPage})));

function Application() {
  const { user, mode } = useAuth();
  const canUseCitizenChat = !user || user.role === "warga";
  return (
    <AppContextProvider key={user?.id || "guest"}>
      <RouteFocus />
      <ConnectionNotice />
      <div className="min-h-screen bg-[#F5F7FB] text-[#172B45] font-sans antialiased selection:bg-[#17324D] selection:text-white relative">
        <a
          href="#main-content"
          className="skip-link"
          onClick={(event) => {
            event.preventDefault();
            document.getElementById("main-content")?.focus();
          }}
        >
          Lewati ke isi halaman
        </a>
        <Suspense fallback={<main id="main-content" className="workspace-content" aria-busy="true"><p role="status">Membuka ruang kerja…</p></main>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/bantuan" element={<HelpPage />} />
          <Route path="/katalog" element={mode === "api" ? <ApiCatalog /> : <CatalogPage />} />
          <Route path="/kebutuhan" element={mode === "api" ? <ApiCatalog /> : <NeedsPage />} />
          <Route path="/panduan" element={mode === "api" ? <ApiCatalog /> : <ServiceDetailPage />} />
          <Route path="/layanan/:id" element={mode === "api" ? <ApiCatalog /> : <ServiceDetailPage />} />
          <Route path="/masuk" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />
          <Route path="/lupa-sandi" element={<PasswordRecoveryPage />} />
          <Route path="/privasi" element={<PrivacyPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/akun" element={<AccountPage />} />
          </Route>
          <Route element={<RequireAuth roles={["warga"]} />}>
            <Route path="/keluarga" element={<FamilyPage />} />
            <Route path="/dashboard" element={mode === "api" ? <ApiCitizenHome /> : <DashboardPage />} />
            <Route path="/persiapan" element={mode === "api" ? <ApiCitizenHome /> : <PreparationListPage />} />
            <Route
              path="/persiapan/kebutuhan"
              element={mode === "api" ? <ApiPreparation /> : <PreparationNeedPage />}
            />
            <Route path="/persiapan/data" element={mode === "api" ? <ApiPreparation /> : <PreparationDataPage />} />
            <Route
              path="/persiapan/dokumen"
              element={mode === "api" ? <ApiPreparation /> : <PreparationDocsPage />}
            />
            <Route
              path="/persiapan/pemeriksaan"
              element={mode === "api" ? <ApiPreparation /> : <PreparationInspectionPage />}
            />
            <Route
              path="/persiapan/ringkasan"
              element={mode === "api" ? <ApiPreparation /> : <PreparationSummaryPage />}
            />
            <Route path="/pelacakan" element={mode === "api" ? <ApiCitizenHome /> : <TrackingPage />} />
            <Route path="/pelacakan/catat" element={mode === "api" ? <ApiOfficialEntry /> : <TrackingPage />} />
            <Route path="/pelacakan/:id" element={mode === "api" ? <ApiTrackingDetail /> : <TrackingPage />} />
          </Route>
          <Route element={<RequireAuth roles={["petugas"]} />}>
            <Route path="/petugas" element={mode === "api" ? <ApiOfficer /> : <OfficerPage />} />
            <Route path="/petugas/ringkasan" element={mode === "api" ? <ApiOfficer /> : <OfficerOverviewPage />} />
            <Route path="/petugas/riwayat" element={mode === "api" ? <ApiOfficer /> : <OfficerHistoryPage />} />
            <Route path="/petugas/riwayat/:id" element={mode === "api" ? <ApiOfficer /> : <OfficerPage />} />
            <Route path="/petugas/:id" element={mode === "api" ? <ApiOfficer /> : <OfficerPage />} />
          </Route>
          <Route element={<RequireAuth roles={["admin"]} />}>
            {['/admin','/admin/akun','/admin/layanan','/admin/petugas','/admin/sumber','/admin/aktivitas','/admin/bantuan'].map(path=><Route key={path} path={path} element={<AdminPage />} />)}
          </Route>
          <Route path="/akses-ditolak" element={<AccessDeniedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
        <ToastContainer />
        <DemoGuide />
        {canUseCitizenChat && <>
          <ChatbotModal />
          <FloatingAiButton />
        </>}
      </div>
    </AppContextProvider>
  );
}

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <UserPreferencesProvider>
          <Application />
        </UserPreferencesProvider>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
