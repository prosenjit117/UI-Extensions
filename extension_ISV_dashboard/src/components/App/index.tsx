import React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { AppShell } from "@mantine/core";
import Sidebar from "../Sidebar";
import Dashboard from "../../pages/Dashboard";
import CompanyView from "../../pages/CompanyView";
import ProductDetail from "../../pages/ProductDetail";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Error has been caught by error boundary
    // In production, you might want to log this to an error tracking service
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "2rem" }}>
          <h2 style={{ color: "#d32f2f", marginBottom: "1rem" }}>
            Something went wrong
          </h2>
          <p style={{ color: "#666", marginBottom: "1rem" }}>
            {this.state.error?.message || "An unexpected error occurred"}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: "0.5rem 1rem",
              backgroundColor: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const App = (): JSX.Element => {
  return (
    <ErrorBoundary>
      <Router>
        <AppShell
          navbar={<Sidebar />}
          styles={{
            main: {
              padding: 0,
            },
          }}
        >
          <AppShell.Main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/list" element={<Dashboard viewMode="flat_list" />} />
              <Route path="/companies/:companyId" element={<CompanyView />} />
              <Route path="/products/:productId" element={<ProductDetail />} />
            </Routes>
          </AppShell.Main>
        </AppShell>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
