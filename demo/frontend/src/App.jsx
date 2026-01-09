import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Menu from './pages/Menu';
import ScheduleMeal from './pages/ScheduleMeal';
import MyOrders from './pages/MyOrders';
import Notifications from './pages/Notifications';
import MonthlyPlan from './pages/MonthlyPlan';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="App">
              <Navbar />
              <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Public routes */}
            <Route path="/menu" element={<Menu />} />
            
            {/* Protected user routes */}
            <Route 
              path="/schedule" 
              element={
                <PrivateRoute>
                  <ScheduleMeal />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/orders" 
              element={
                <PrivateRoute>
                  <MyOrders />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/notifications" 
              element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/monthly-plan" 
              element={
                <PrivateRoute>
                  <MonthlyPlan />
                </PrivateRoute>
              } 
            />
            
            {/* Staff routes */}
            <Route 
              path="/staff" 
              element={
                <PrivateRoute allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin" 
              element={
                <PrivateRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </PrivateRoute>
              } 
            />
            
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/menu" replace />} />
              </Routes>
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

