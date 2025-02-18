// src/App.tsx
import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard"; // Use default import
import LoginPage from "./components/LoginPage";
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminPrivateRoute from "./pages/Admin/AdminPrivateRoute";
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <div className="app">
      <main className="container">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminPrivateRoute>
                <AdminDashboard />
              </AdminPrivateRoute>
            }
          />
          {/* Other routes */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
