import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";
import AppLayout from "./components/AppLayout";

import LoginPage from "./pages/LoginPage.tsx";
import AddInvoicePage from "./pages/invoices/AddInvoicePage.tsx";
import InvoiceHistoryPage from "./pages/invoices/InvoiceHistoryPage.tsx";
// import UpdateInvoicePage from "./pages/invoices/UpdateInvoicePage.tsx";

import CostCalculatorPage from "./pages/costings/CostCalculatorPage.tsx";
import CostingHistoryPage from "./pages/costings/CostingHistoryPage.tsx";
import InventoryListPage from "./pages/inventory/InventoryListPage.tsx";
import AddInventoryPage from "./pages/inventory/AddInventoryPage.tsx";
import EditInventoryPage from "./pages/inventory/EditInventoryPage.tsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/invoices/add" replace />} />

            <Route path="invoices/add" element={<AddInvoicePage />} />
            <Route path="invoices/history" element={<InvoiceHistoryPage />} />
            {/* <Route path="invoices/update" element={<UpdateInvoicePage />} /> */}

            <Route path="cost/calc" element={<CostCalculatorPage />} />
            <Route path="cost/calc/:id" element={<CostCalculatorPage />} />
            <Route path="cost/history" element={<CostingHistoryPage />} />

            <Route path="inventory" element={<InventoryListPage />} />
            <Route path="inventory/add" element={<AddInventoryPage />} />
            <Route path="inventory/manage" element={<EditInventoryPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
