import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Dashboard } from "./pages/Dashboard";
import LoginPage from "./components/LoginPage";
import AdminPanel from "./components/AdminPanel"; // Make sure this component exists
import { PrivateRoute } from "./components/PrivateRoute";

function App() {
  return (
    <Router>
      <div className="app">
        <main className="container">
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
