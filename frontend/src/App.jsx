import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import AssessmentPage from "./pages/AssessmentPage";
import ResultsPage from "./pages/ResultsPage";
import HistoryPage from "./pages/HistoryPage";
import AboutPage from "./pages/AboutPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { authService } from "./services/api";

const TOKEN_KEY = "mindpulse_token";
const USER_KEY = "mindpulse_user";
const THEME_KEY = "mindpulse_theme";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem(TOKEN_KEY));
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "light");
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  const persistAuth = ({ token: nextToken, user: nextUser }) => {
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const toggleTheme = () => {
    setTheme((current) => {
      const next = current === "dark" ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  useEffect(() => {
    const verifySession = async () => {
      if (!token) {
        return;
      }

      try {
        const data = await authService.me();
        setUser((current) => current || data.user);
      } catch (error) {
        logout();
      }
    };

    verifySession();
  }, [token]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      <Route
        path="/login"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage onAuthSuccess={persistAuth} theme={theme} onToggleTheme={toggleTheme} />
          )
        }
      />
      <Route
        path="/register"
        element={
          token ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <RegisterPage onAuthSuccess={persistAuth} theme={theme} onToggleTheme={toggleTheme} />
          )
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={Boolean(token)}>
            <DashboardPage user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/assessment"
        element={
          <ProtectedRoute isAuthenticated={Boolean(token)}>
            <AssessmentPage user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/results"
        element={
          <ProtectedRoute isAuthenticated={Boolean(token)}>
            <ResultsPage user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/history"
        element={
          <ProtectedRoute isAuthenticated={Boolean(token)}>
            <HistoryPage user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/about"
        element={
          <ProtectedRoute isAuthenticated={Boolean(token)}>
            <AboutPage user={user} onLogout={logout} theme={theme} onToggleTheme={toggleTheme} />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
