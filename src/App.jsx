import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import DashboardPage from "./pages/DashboardPage";
import HistoryPage from "./pages/HistoryPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import SchedulePage from "./pages/SchedulePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="riwayat" element={<HistoryPage />} />
          <Route path="riwayat/:id" element={<HistoryDetailPage />} />
          <Route path="jadwal" element={<SchedulePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}