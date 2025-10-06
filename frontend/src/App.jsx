import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CitizenDashboard from './pages/CitizenDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import HeatmapPage from './pages/HeatmapPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Protected Routes */}
              {/* Citizen Dashboard */}
              <Route path="/dashboard" element={
                <ProtectedRoute  roles={['citizen']}>
                  <CitizenDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/staff" element={
                <ProtectedRoute roles={['staff', 'admin']}>
                  <StaffDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute roles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/submit-complaint" element={
                <ProtectedRoute roles={['citizen']}>
                  <SubmitComplaint />
                </ProtectedRoute>
              } />
              
              <Route path="/complaint-history" element={
                <ProtectedRoute roles={['citizen']}>
                  <ComplaintHistory />
                </ProtectedRoute>
              } />
              
              <Route path="/heatmap" element={
                <ProtectedRoute roles={['staff', 'admin']}>
                  <HeatmapPage />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute roles={['citizen', 'staff', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;