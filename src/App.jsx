import { Toaster } from "sonner"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { AnimatePresence, motion } from 'framer-motion';

// Portal & Marketplace
import Marketplace from '@/pages/Marketplace';
import MarketplacePage from '@/pages/MarketplacePage';
import Portal from '@/pages/Portal';
import Register from '@/pages/Register';
import Career from '@/pages/Career';
import CareerDetail from '@/pages/CareerDetail';

// Mitra
import MitraLayout from '@/pages/mitra/MitraLayout';
import MitraDashboard from '@/pages/mitra/MitraDashboard';
import MitraProducts from '@/pages/mitra/MitraProducts';
import MitraOrders from '@/pages/mitra/MitraOrders';
import MitraMenu from '@/pages/mitra/MitraMenu';
import MitraKebutuhan from '@/pages/mitra/MitraKebutuhan';
import MitraNutrition from '@/pages/mitra/MitraNutrition';
import MitraComplaints from '@/pages/mitra/MitraComplaints';
import MitraReports from '@/pages/mitra/MitraReports';
import MitraDigitalServices from '@/pages/mitra/MitraDigitalServices';
import MitraCareer from '@/pages/mitra/MitraCareer';

// Supplier
import SupplierLayout from '@/pages/supplier/SupplierLayout';
import SupplierDashboard from '@/pages/supplier/SupplierDashboard';
import SupplierProducts from '@/pages/supplier/SupplierProducts';
import SupplierOrders from '@/pages/supplier/SupplierOrders';
import SupplierIncome from '@/pages/supplier/SupplierIncome';
import SupplierComplaints from '@/pages/supplier/SupplierComplaints';
import SupplierChat from '@/pages/supplier/SupplierChat';
import SupplierDigitalServices from '@/pages/supplier/SupplierDigitalServices';
import SupplierRatings from '@/pages/supplier/SupplierRatings';

// Logistik
import LogistikLayout from '@/pages/logistik/LogistikLayout';
import LogistikDashboard from '@/pages/logistik/LogistikDashboard';
import LogistikOrders from '@/pages/logistik/LogistikOrders';
import LogistikPriority from '@/pages/logistik/LogistikPriority';
import LogistikMap from '@/pages/logistik/LogistikMap';
import LogistikReports from '@/pages/logistik/LogistikReports';
import LogistikChat from '@/pages/logistik/LogistikChat';
import LogistikDigitalServices from '@/pages/logistik/LogistikDigitalServices';
import LogistikAgent from '@/pages/logistik/LogistikAgent';
import LogistikCareer from '@/pages/logistik/LogistikCareer';

// Admin
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminStock from '@/pages/admin/AdminStock';
import AdminSuppliers from '@/pages/admin/AdminSuppliers';
import AdminMitra from '@/pages/admin/AdminMitra';
import AdminLogistik from '@/pages/admin/AdminLogistik';
import AdminFinancial from '@/pages/admin/AdminFinancial';
import AdminInflation from '@/pages/admin/AdminInflation';
import AdminSupplyChain from '@/pages/admin/AdminSupplyChain';
import AdminFoodReport from '@/pages/admin/AdminFoodReport';
import AdminChatMitra from '@/pages/admin/AdminChatMitra';
import AdminChatSupplier from '@/pages/admin/AdminChatSupplier';
import AdminChatLogistik from '@/pages/admin/AdminChatLogistik';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminBapokting from '@/pages/admin/AdminBapokting';
import AdminSppgMenus from '@/pages/admin/AdminSppgMenus';
import AdminWarga from '@/pages/admin/AdminWarga';
import AdminPendaftarBaru from '@/pages/admin/AdminPendaftarBaru';
import MitraRecipients from '@/pages/mitra/MitraRecipients';
import MitraCart from '@/pages/mitra/MitraCart';
import MitraTransactions from '@/pages/mitra/MitraTransactions';

// Warga
import WargaLayout from '@/pages/warga/WargaLayout';
import WargaBeranda from '@/pages/warga/WargaBeranda';
import WargaKeranjang from '@/pages/warga/WargaKeranjang';
import WargaCheckout from '@/pages/warga/WargaCheckout';
import WargaPesanan from '@/pages/warga/WargaPesanan';
import WargaPesananDetail from '@/pages/warga/WargaPesananDetail';
import WargaProfil from '@/pages/warga/WargaProfil';

// Knowledge Center
import KnowledgeCenter from '@/pages/KnowledgeCenter';

// Berita
import Berita from '@/pages/Berita';

// Layanan Digital
import Pulsa from '@/pages/Pulsa';
import Tagihan from '@/pages/Tagihan';
import Bpjs from '@/pages/Bpjs';

// GIS Peta Terintegrasi Disperindag Garut
import GisPetaPage from '@/pages/GisPetaPage';
import AdminGis from '@/pages/admin/AdminGis';

const AuthenticatedApp = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
    <motion.div key={location.pathname}
      initial={{ x: 24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      style={{ minHeight: "100vh" }}
    >
    <Routes location={location}>
      {/* Rute publik — tanpa proteksi auth */}
      <Route path="/" element={<Marketplace />} />
      <Route path="/peta" element={<GisPetaPage />} />
      <Route path="/gis" element={<Navigate to="/peta" replace />} />
      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/portal" element={<Portal />} />
      <Route path="/register/:role" element={<Register />} />
      <Route path="/knowledge-center" element={<KnowledgeCenter />} />
      <Route path="/berita" element={<Berita />} />
      <Route path="/career" element={<Career />} />
      <Route path="/career/:id" element={<CareerDetail />} />

      {/* Rute terproteksi — redirect ke /portal jika belum login */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/portal" replace />} />}>
        {/* Layanan Digital */}
        <Route path="/pulsa" element={<Pulsa />} />
        <Route path="/tagihan" element={<Tagihan />} />
        <Route path="/bpjs" element={<Bpjs />} />

        {/* Mitra */}
        <Route element={<ProtectedRoute allowedRoles={["mitra"]} />}>
          <Route element={<MitraLayout />}>
            <Route path="/mitra/dashboard" element={<MitraDashboard />} />
            <Route path="/mitra/products" element={<MitraProducts />} />
            <Route path="/mitra/orders" element={<MitraOrders />} />
            <Route path="/mitra/menu" element={<MitraMenu />} />
            <Route path="/mitra/kebutuhan" element={<MitraKebutuhan />} />
            <Route path="/mitra/nutrition" element={<MitraNutrition />} />
            <Route path="/mitra/complaints" element={<MitraComplaints />} />
            <Route path="/mitra/reports" element={<MitraReports />} />
            <Route path="/mitra/digital-services" element={<MitraDigitalServices />} />
            <Route path="/mitra/recipients" element={<MitraRecipients />} />
            <Route path="/mitra/cart" element={<MitraCart />} />
            <Route path="/mitra/transactions" element={<MitraTransactions />} />
            <Route path="/mitra/career" element={<MitraCareer />} />
          </Route>
        </Route>

        {/* Supplier */}
        <Route element={<ProtectedRoute allowedRoles={["supplier"]} />}>
          <Route element={<SupplierLayout />}>
            <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
            <Route path="/supplier/products" element={<SupplierProducts />} />
            <Route path="/supplier/orders" element={<SupplierOrders />} />
            <Route path="/supplier/income" element={<SupplierIncome />} />
            <Route path="/supplier/complaints" element={<SupplierComplaints />} />
            <Route path="/supplier/ratings" element={<SupplierRatings />} />
            <Route path="/supplier/chat" element={<SupplierChat />} />
            <Route path="/supplier/digital-services" element={<SupplierDigitalServices />} />
          </Route>
        </Route>

        {/* Logistik */}
        <Route element={<ProtectedRoute allowedRoles={["logistik"]} />}>
          <Route element={<LogistikLayout />}>
            <Route path="/logistik/dashboard" element={<LogistikDashboard />} />
            <Route path="/logistik/orders" element={<LogistikOrders />} />
            <Route path="/logistik/priority" element={<LogistikPriority />} />
            <Route path="/logistik/map" element={<LogistikMap />} />
            <Route path="/logistik/reports" element={<LogistikReports />} />
            <Route path="/logistik/chat" element={<LogistikChat />} />
            <Route path="/logistik/digital-services" element={<LogistikDigitalServices />} />
            <Route path="/logistik/agent" element={<LogistikAgent />} />
            <Route path="/logistik/career" element={<LogistikCareer />} />
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/gis" element={<AdminGis />} />
            <Route path="/admin/peta" element={<Navigate to="/admin/gis" replace />} />
            <Route path="/admin/pendaftar-baru" element={<AdminPendaftarBaru />} />
            <Route path="/admin/users" element={<Navigate to="/admin/pendaftar-baru" replace />} />
            <Route path="/admin/warga" element={<AdminWarga />} />
            <Route path="/admin/stock" element={<AdminStock />} />
            <Route path="/admin/suppliers" element={<AdminSuppliers />} />
            <Route path="/admin/mitra" element={<AdminMitra />} />
            <Route path="/admin/logistik" element={<AdminLogistik />} />
            <Route path="/admin/financial" element={<AdminFinancial />} />
            <Route path="/admin/inflation" element={<AdminInflation />} />
            <Route path="/admin/supply-chain" element={<AdminSupplyChain />} />
            <Route path="/admin/food-report" element={<AdminFoodReport />} />
            <Route path="/admin/chat-mitra" element={<AdminChatMitra />} />
            <Route path="/admin/chat-supplier" element={<AdminChatSupplier />} />
            <Route path="/admin/chat-logistik" element={<AdminChatLogistik />} />
            <Route path="/admin/notifications" element={<AdminNotifications />} />
            <Route path="/admin/bapokting" element={<AdminBapokting />} />
            <Route path="/admin/sppg-menus" element={<AdminSppgMenus />} />
          </Route>
        </Route>

        {/* Warga */}
        <Route element={<ProtectedRoute allowedRoles={["warga", "penerima"]} />}>
          {/* Redirect Rute Legacy Penerima ke Warga */}
          <Route path="/penerima/dashboard" element={<Navigate to="/warga/beranda" replace />} />
          <Route path="/penerima/daftar" element={<Navigate to="/warga/beranda" replace />} />
          <Route path="/penerima/rating" element={<Navigate to="/warga/beranda" replace />} />
          <Route path="/penerima/*" element={<Navigate to="/warga/beranda" replace />} />
          <Route path="/penerima" element={<Navigate to="/warga/beranda" replace />} />

          {/* Warga — pengalaman baru (AloFresh) */}
          <Route element={<WargaLayout />}>
            <Route path="/warga/beranda" element={<WargaBeranda />} />
            <Route path="/warga/keranjang" element={<WargaKeranjang />} />
            <Route path="/warga/checkout" element={<WargaCheckout />} />
            <Route path="/warga/pesanan" element={<WargaPesanan />} />
            <Route path="/warga/pesanan/:id" element={<WargaPesananDetail />} />
            <Route path="/warga/profil" element={<WargaProfil />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </motion.div>
    </AnimatePresence>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              color: '#166534',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '14px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            },
            success: {
              style: {
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#166534',
              },
              iconTheme: {
                primary: '#16a34a',
                secondary: '#f0fdf4',
              },
            },
            error: {
              style: {
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
              },
            },
          }}
        />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App