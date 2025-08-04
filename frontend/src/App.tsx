import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AIProvider } from './contexts/AIContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Capabilities from './pages/Capabilities';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <AIProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/capabilities" element={
              <ProtectedRoute>
                <Layout>
                  <Capabilities />
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </AIProvider>
    </AuthProvider>
  );
}

export default App;
