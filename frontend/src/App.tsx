import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { AppContextProvider } from "./context/AppContext";
import { ToastContainer } from "./components/ToastContainer";
import { ChatbotModal } from "./components/ChatbotModal";
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
import { OfficerPage } from "./pages/OfficerPage";
import { AdminPage } from "./pages/AdminPage";
function Application() {
  const { user } = useAuth();
  return (
    <AppContextProvider key={user?.id || "guest"}>
      <RouteFocus />
      <div className="min-h-screen bg-[#F5F7FB] text-[#172B45] font-sans antialiased selection:bg-[#1769D2] selection:text-white relative">
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
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/katalog" element={<CatalogPage />} />
          <Route path="/panduan" element={<ServiceDetailPage />} />
          <Route path="/layanan/:id" element={<ServiceDetailPage />} />
          <Route path="/masuk" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />
          <Route path="/lupa-sandi" element={<PasswordRecoveryPage />} />
          <Route path="/privasi" element={<PrivacyPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/akun" element={<AccountPage />} />
          </Route>
          <Route element={<RequireAuth roles={["warga"]} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/persiapan" element={<PreparationListPage />} />
            <Route
              path="/persiapan/kebutuhan"
              element={<PreparationNeedPage />}
            />
            <Route path="/persiapan/data" element={<PreparationDataPage />} />
            <Route
              path="/persiapan/dokumen"
              element={<PreparationDocsPage />}
            />
            <Route
              path="/persiapan/pemeriksaan"
              element={<PreparationInspectionPage />}
            />
            <Route
              path="/persiapan/ringkasan"
              element={<PreparationSummaryPage />}
            />
            <Route path="/pelacakan" element={<TrackingPage />} />
          </Route>
          <Route element={<RequireAuth roles={["petugas"]} />}>
            <Route path="/petugas" element={<OfficerPage />} />
          </Route>
          <Route element={<RequireAuth roles={["admin"]} />}>
            <Route path="/admin" element={<AdminPage />} />
          </Route>
          <Route path="/akses-ditolak" element={<AccessDeniedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer />
        <ChatbotModal />
      </div>
    </AppContextProvider>
  );
}
export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Application />
      </AuthProvider>
    </HashRouter>
  );
}
export default App;
