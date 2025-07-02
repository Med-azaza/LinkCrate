import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AuthGuard from "./components/auth/AuthGuard";
import SignUpPage from "./pages/SignUpPage";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen ">
          <Toaster />
          <Routes>
            <Route
              path="/"
              element={
                <AuthGuard requireAuth={false}>
                  <HomePage />
                </AuthGuard>
              }
            />
            <Route
              path="/login"
              element={
                <AuthGuard requireAuth={false}>
                  <LoginPage />
                </AuthGuard>
              }
            />
            <Route
              path="/signup"
              element={
                <AuthGuard requireAuth={false}>
                  <SignUpPage />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGuard requireAuth>
                  <DashboardPage />
                </AuthGuard>
              }
            />
            <Route path="/:code" element={<ProfilePage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
