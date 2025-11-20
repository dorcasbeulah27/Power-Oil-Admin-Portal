import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Campaigns from './pages/Campaigns';
import CampaignForm from './pages/CampaignForm';
import Locations from './pages/Locations';
import LocationForm from './pages/LocationForm';
import Prizes from './pages/Prizes';
import PrizeForm from './pages/PrizeForm';
import PrizeRules from './pages/PrizeRules';
import Reports from './pages/Reports';

// Layout
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/campaigns/new" element={<CampaignForm />} />
                    <Route path="/campaigns/edit/:id" element={<CampaignForm />} />
                    <Route path="/locations" element={<Locations />} />
                    <Route path="/locations/new" element={<LocationForm />} />
                    <Route path="/locations/edit/:id" element={<LocationForm />} />
                    <Route path="/prizes" element={<Prizes />} />
                    <Route path="/prizes/new" element={<PrizeForm />} />
                    <Route path="/prizes/edit/:id" element={<PrizeForm />} />
                    <Route path="/prize-rules" element={<PrizeRules />} />
                    <Route path="/reports" element={<Reports />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </Router>
    </AuthProvider>
  );
}

export default App;



