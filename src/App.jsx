import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { AppProvider, useAppContext } from "./contexts";
import Header from "./components/Header";
import SideBar from "./components/SideBar";
import Login from "./components/Login";
import GameCategory from "./components/MainContent/GameCategory";
import GameProvider from "./components/MainContent/GameProvider";
import GameManager from "./components/MainContent/GameManager";
import GameStore from "./components/MainContent/GameStore";
import GameTag from "./components/MainContent/GameTag";
import { memo } from "react";
import "./styles/responsive.css";

// Memoized page components to prevent unnecessary re-renders
const MemoizedGameCategory = memo(GameCategory);
const MemoizedGameProvider = memo(GameProvider);
const MemoizedGameManager = memo(GameManager);
const MemoizedGameStore = memo(GameStore);
const MemoizedGameTag = memo(GameTag);

// Protected Route Component - Memoized to prevent unnecessary re-renders
const ProtectedRoute = memo(({ children, onLogout }) => {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token && onLogout) {
      onLogout();
    }
  }, [token, onLogout]);

  if (!token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
});

ProtectedRoute.displayName = "ProtectedRoute";

// Main App Content - Must be inside AppProvider
const AppContentInner = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const { loadAllInitialData } = useAppContext();

  // Check authentication status
  const checkAuth = useCallback(() => {
    const token = localStorage.getItem("token");
    const authenticated = !!token;
    setIsAuthenticated(authenticated);
    setIsChecking(false);
    return authenticated;
  }, []);

  // Handle logout
  const handleLogout = useCallback(() => {
    // Clear all authentication data
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    // Update state
    setIsAuthenticated(false);

    // Navigate to dashboard
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  // Handle login success
  const handleLoginSuccess = useCallback(
    (data) => {
      // Verify token was stored
      const token = localStorage.getItem("token");
      if (token) {
        setIsAuthenticated(true);
        // Load all initial data after successful login
        if (loadAllInitialData) {
          loadAllInitialData();
        }
        // Navigate to game category page
        navigate("/game-category", { replace: true });
      } else {
        console.error("Token not found after login");
        message.error("Login failed: Token not stored");
      }
    },
    [navigate, loadAllInitialData]
  );

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Listen for storage changes (for multi-tab logout)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === null) {
        // Token was removed or storage was cleared
        if (!localStorage.getItem("token")) {
          handleLogout();
        } else {
          // Token was added/updated
          checkAuth();
        }
      }
    };
 
    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom logout events
    const handleLogoutEvent = () => {
      handleLogout();
    };

    window.addEventListener("logout", handleLogoutEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("logout", handleLogoutEvent);
    };
  }, [handleLogout, checkAuth]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "#ffffff",
        }}
      >
        <div style={{ color: "#333", fontSize: "18px" }}>Loading...</div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/dashboard"
          element={<Login onLoginSuccess={handleLoginSuccess} />}
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <Header onLogout={handleLogout} />
      <div className="main-layout">
        <SideBar />
        <div className="main-content">
          <Routes>
            <Route
              path="/game-category"
              element={
                <ProtectedRoute onLogout={handleLogout}>
                  <MemoizedGameCategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-provider"
              element={
                <ProtectedRoute onLogout={handleLogout}>
                  <MemoizedGameProvider />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-manager"
              element={
                <ProtectedRoute onLogout={handleLogout}>
                  <MemoizedGameManager />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-store"
              element={
                <ProtectedRoute onLogout={handleLogout}>
                  <MemoizedGameStore />
                </ProtectedRoute>
              }
            />
            <Route
              path="/game-tags"
              element={
                <ProtectedRoute onLogout={handleLogout}>
                  <MemoizedGameTag />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={<Navigate to="/game-category" replace />}
            />
            <Route
              path="/"
              element={<Navigate to="/game-category" replace />}
            />
            <Route
              path="*"
              element={<Navigate to="/game-category" replace />}
            />
          </Routes>
        </div>
      </div>
    </>
  );
};

// Wrapper component that doesn't use context
const AppContent = () => {
  return (
    <Router>
      <div className="container">
        <AppContentInner />
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;